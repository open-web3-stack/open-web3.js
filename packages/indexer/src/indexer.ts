import { Sequelize, Op, Options, SyncOptions } from 'sequelize';
import { Registry } from '@polkadot/types/types';
import { WsProvider } from '@polkadot/rpc-provider';
import { auditTime, mergeMap } from 'rxjs/operators';
import Scanner from '@open-web3/scanner';
import {
  RegisteredTypes,
  ChainInfo,
  SubscribeBlock,
  SubscribeBlockError,
  DispatchableCall as DispatchableCallType
} from '@open-web3/scanner/types';

import init, { Status, Block, Metadata, Extrinsic, Events, DispatchableCall, EvmLogs } from './models';
import log from './log';

export interface IndexerOptions extends RegisteredTypes {
  dbUrl: string;
  dbOptions?: Options;
  wsUrl: string;
  sync?: boolean;
  syncOptions?: SyncOptions;
}

export default class Indexer {
  // eslint-disable-next-line
  protected constructor(private readonly db: Sequelize, private readonly scanner: Scanner) {}

  static async create(options: IndexerOptions): Promise<Indexer> {
    log.info('Create Indexer');

    const db = new Sequelize(options.dbUrl, options.dbOptions);

    await db.authenticate();

    const wsProvider = new WsProvider(options.wsUrl);

    log.info('Init DB');

    init(db);

    if (options.sync) {
      log.info('Sync DB');
      await db.sync(options.syncOptions);
      log.info('Success');
    }

    return new Indexer(
      db,
      new Scanner({
        wsProvider,
        types: options.types,
        typesAlias: options.typesAlias,
        typesSpec: options.typesSpec,
        typesChain: options.typesChain,
        typesBundle: options.typesBundle
      })
    );
  }

  async start(
    options: {
      start?: number;
      end?: number;
      timeout?: number;
      concurrent?: number;
      confirmation?: number;
      blockTime?: number;
      dbconcurrent?: number;
    } = {}
  ): Promise<void> {
    const { start, end, timeout, concurrent = 100, confirmation = 4, blockTime = 4000, dbconcurrent = 5 } = options;
    let startBlockNumber = start;

    if (!startBlockNumber) {
      const statuses = (await Status.findOne({ where: { status: 0 }, order: [['blockNumber', 'DESC']] })) as any;
      const lastBlockNumber = statuses ? Number(statuses.blockNumber) : 0;
      await this.fixLostBlock(lastBlockNumber, 0, {
        concurrent,
        confirmation
      });
      startBlockNumber = lastBlockNumber;
    }

    const source$ = this.scanner.subscribe({ start: startBlockNumber, end, timeout, concurrent, confirmation });

    source$.pipe(mergeMap((result) => this.pushData(result), dbconcurrent)).subscribe();

    source$.pipe(auditTime(blockTime * 10)).subscribe(() => {
      for (const id of Object.keys(this.scanner.chainInfo)) {
        this.syncMetadata(this.scanner.chainInfo[id]);
      }
    });

    // eslint-disable-next-line
    source$.pipe(auditTime(blockTime - 1)).subscribe(async () => {
      const blockNumbers = await this.queryFailBlock();
      for (const number of blockNumbers) {
        await this.deleteBlock(number);
        const blockDetail = await this.getBlock(number);
        await this.pushData(blockDetail);
      }
    });

    // affect performance
    // source$
    //   .pipe(
    //     auditTime(3999),
    //     pairwise(),
    //     mergeMap(([pre, current]) => {
    //       return this.fixLostBlock(Number(current.blockNumber), Number(pre.blockNumber));
    //     })
    //   )
    //   .subscribe();
  }

  async fixLostBlock(lastBlockNumber: number, low: number, { concurrent, confirmation }) {
    if (!low) {
      if (!(await this.noMissBlock(low))) {
        low = 0;
      }
    }

    while (!(await this.noMissBlock(lastBlockNumber))) {
      const start = await this.findFirstLostBlock(lastBlockNumber, low, concurrent);

      if (start < 0) return;

      const end = Math.min(start + 200, lastBlockNumber);
      const source$ = this.scanner
        .subscribe({
          start,
          end,
          concurrent: Math.floor(concurrent / 2),
          confirmation: confirmation
        })
        .pipe(
          mergeMap((result) => {
            return this.pushData(result);
          })
        );

      source$.subscribe();

      await source$.toPromise();

      if (await this.noMissBlock(end)) {
        low = end;
      } else {
        low = start;
      }
    }
  }

  async findFirstLostBlock(high: number, low: number, concurrent: number) {
    if (await this.noMissBlock(high)) return -1;

    let result = low;

    while (high - low > concurrent) {
      const mid = low + ((high - low) >> 2);
      const value = await this.noMissBlock(mid);

      if (value) {
        result = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    log.warn(`From ${result}`);
    return result;
  }

  async noMissBlock(blockNumber: number) {
    const count = await Status.count({
      where: {
        blockNumber: {
          [Op.lt]: blockNumber
        }
      }
    });
    return count === blockNumber;
  }

  async pushData(result: SubscribeBlock | SubscribeBlockError) {
    try {
      if (result.result) {
        const t = await this.db.transaction();

        const block = result.result;
        await Promise.all([
          this.syncBlock(block, { transaction: t }),
          this.syncEvents(block, { transaction: t }),
          this.syncExtrinsics(block, { transaction: t }),
          this.syncDispatchableCalls(block, { transaction: t }),
          this.syncStatus(block.number, block.hash, 0, { transaction: t }),
          this.syncEvmLogs(block, { transaction: t })
        ])
          .then(() => {
            return t.commit();
          })
          .then(() => {
            return log.info(`${block.number}-${block.hash}`);
          })
          .catch(async (error) => {
            t.rollback();
            log.error(`${block.number}-${block.hash}`, error, { errorCode: 2 });
            await this.syncStatus(block.number, block.hash, 2);
          });
      } else {
        log.error(`${result.blockNumber}-unknown`, result.error, { errorCode: 1 });

        const blockNumber = result.blockNumber;
        this.syncStatus(blockNumber, null, 1);
      }
    } catch (error) {
      log.error(`${result.blockNumber}`, error);
    }
  }

  async queryFailBlock(limit = 10) {
    const result = await Status.findAll({
      where: { status: { [Op.not]: 0 } },
      limit,
      order: [['updatedAt', 'asc']],
      attributes: ['blockNumber']
    });
    return result.map((r) => r.toJSON()).map((r: any) => Number(r.blockNumber));
  }

  async getBlock(blockNumber: number) {
    let result: SubscribeBlock | SubscribeBlockError;
    log.warn(`${blockNumber} retry`);

    try {
      const blockDetail = await this.scanner.getBlockDetail({ blockNumber });
      result = {
        blockNumber: blockDetail.number,
        result: blockDetail,
        error: null
      };
    } catch (error) {
      result = {
        blockNumber: blockNumber,
        error: error,
        result: null
      };
    }

    return result;
  }

  async syncStatus(blockNumber: number, blockHash: string | null, status: number, options?: any) {
    await Status.upsert(
      {
        blockNumber: blockNumber,
        blockHash: blockHash,
        status: status
      },
      options || {}
    );
  }

  async syncEvmLogs(block: SubscribeBlock['result'], options: any) {
    const logs = block.events.filter((e) => {
      return e.method.toUpperCase() === 'LOG' && e.section.toUpperCase() === 'EVM';
    });

    if (logs.length) {
      for (const [index, log] of logs.entries()) {
        const tx = block.extrinsics.find((e) => e.index === log.phaseIndex);
        if (!tx) throw new Error('Error! The extrinsic for event could not be found');

        await EvmLogs.upsert(
          {
            id: `${block.hash}-${index}`,
            transactionHash: tx.hash,
            blockNumber: block.number,
            blockHash: block.hash,
            transactionIndex: log.phaseIndex,
            removed: false,
            address: log.args[0].address,
            data: log.args[0].data,
            topics: log.args[0].topics,
            logIndex: index
          },
          options
        );
      }
    }
  }

  async syncEvents(block: SubscribeBlock['result'], options: any) {
    const request: any[] = [];
    for (const event of block.events) {
      request.push(
        Events.upsert(
          {
            id: `${block.number}-${event.index}`,
            blockHash: block.hash,
            blockNumber: block.number,
            index: event.index,
            section: event.section,
            method: event.method,
            args: event.args,
            argsDef: event.argsDef,
            bytes: event.bytes,
            phaseType: event.phaseType,
            phaseIndex: event.phaseIndex
          },
          options
        )
      );
    }
    await Promise.all(request);
  }

  async syncBlock(block: SubscribeBlock['result'], options: any) {
    await Block.upsert(
      {
        blockHash: block.hash,
        blockNumber: block.number,
        timestamp: block.timestamp,
        parentHash: block.raw.block.header.parentHash,
        author: block.author,
        raw: block.raw
      },
      options
    );
  }

  async syncExtrinsics(block: SubscribeBlock['result'], options: any) {
    const request: any[] = [];
    for (const extrinsic of block.extrinsics) {
      request.push(
        Extrinsic.upsert(
          {
            id: `${block.hash}-${extrinsic.index}`,
            hash: extrinsic.hash,
            blockHash: block.hash,
            blockNumber: block.number,
            index: extrinsic.index,
            section: extrinsic.section,
            method: extrinsic.method,
            args: extrinsic.args,
            nonce: extrinsic.nonce,
            tip: extrinsic.tip,
            signer: extrinsic.signer,
            result: extrinsic.result,
            bytes: extrinsic.bytes
          },
          options
        )
      );
    }
    await Promise.all(request);
  }

  async syncDispatchableCalls(block: SubscribeBlock['result'], options: any) {
    type ChildCall = {
      args: any;
      callIndex: 'string';
    };

    const promises: Promise<any>[] = [];
    let registry: Registry;

    const decodeCallIndex = (callIndex: string) => {
      if (!registry) {
        registry = block.chainInfo.registry;
      }
      const callIndexNum = parseInt(callIndex, 16);
      const sectionIndex = callIndexNum >> 8;
      const methodIndex = callIndexNum & 0xff;
      const call = registry.findMetaCall(new Uint8Array([sectionIndex, methodIndex]));
      return {
        section: call.section.toString(),
        method: call.method.toString()
      };
    };

    const handle = (
      call: DispatchableCallType,
      parentId: string | null,
      childIndex: number | null,
      extrinsic: SubscribeBlock['result']['extrinsics'][0]
    ) => {
      const extrinsicId = `${block.hash}-${extrinsic.index}`;
      const id = parentId ? `${parentId}-${childIndex}` : extrinsicId;

      promises.push(
        DispatchableCall.upsert(
          {
            id,
            section: call.section,
            method: call.method,
            args: call.args,
            extrinsic: extrinsicId,
            parent: parentId,
            origin: extrinsic.signer
          },
          options
        )
      );

      if (call.section === 'utility' && call.method === 'batch') {
        const calls = call.args.calls as ChildCall[];
        calls.forEach((childCall, idx) => {
          const { section, method } = decodeCallIndex(childCall.callIndex);
          handle(
            {
              callIndex: childCall.callIndex,
              section,
              method,
              args: childCall.args
            },
            id,
            idx,
            extrinsic
          );
        });
      } else if (call.section === 'sudo' && call.method === 'sudo') {
        const childCall = (call.args.call || call.args.proposal) as ChildCall;
        const { section, method } = decodeCallIndex(childCall.callIndex);
        handle(
          {
            callIndex: childCall.callIndex,
            section,
            method,
            args: childCall.args
          },
          id,
          0,
          extrinsic
        );
      }
    };
    for (const extrinsic of block.extrinsics) {
      handle(extrinsic, null, null, extrinsic);
    }
    return Promise.all(promises);
  }

  async syncMetadata(chainInfo: ChainInfo) {
    const find = (await Metadata.findOne({
      where: {
        id: chainInfo.id
      },
      attributes: ['id', 'minBlockNumber', 'maxBlockNumber']
    })) as any;

    if (!find) {
      await Metadata.upsert({
        id: chainInfo.id,
        minBlockNumber: chainInfo.min,
        maxBlockNumber: chainInfo.max,
        bytes: chainInfo.bytes,
        json: JSON.stringify(chainInfo.metadata),
        runtimeVersion: chainInfo.runtimeVersion
      });
    } else {
      await find.update({
        minBlockNumber: Math.min(chainInfo.min, find.minBlockNumber),
        maxBlockNumber: Math.max(chainInfo.max, find.maxBlockNumber)
      });
    }
  }

  async deleteBlocks(minBlockNumber: number) {
    await Promise.all([
      Block.destroy({
        where: { blockNumber: { [Op.gte]: minBlockNumber } }
      }),
      Events.destroy({
        where: { blockNumber: { [Op.gte]: minBlockNumber } }
      }),
      Extrinsic.destroy({
        where: { blockNumber: { [Op.gte]: minBlockNumber } }
      }),
      Status.destroy({
        where: { blockNumber: { [Op.gte]: minBlockNumber } }
      }),
      EvmLogs.destroy({
        where: { blockNumber: { [Op.gte]: minBlockNumber } }
      })
    ]);
  }

  async deleteBlock(blockNumber: number) {
    await Promise.all([
      Block.destroy({
        where: { blockNumber: blockNumber }
      }),
      Events.destroy({
        where: { blockNumber: blockNumber }
      }),
      Extrinsic.destroy({
        where: { blockNumber: blockNumber }
      }),
      EvmLogs.destroy({
        where: { blockNumber: blockNumber }
      })
    ]);
  }

  close(): void {
    this.db.close();
  }
}
