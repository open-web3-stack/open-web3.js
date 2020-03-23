import { Sequelize, Op, SyncOptions } from 'sequelize';
import { WsProvider } from '@polkadot/rpc-provider';
import { auditTime } from 'rxjs/operators';

import init, { Status, Block, Metadata, Extrinsic, Events } from './models';
import Scanner from '../../scanner/src';
import { TypeProvider, ChainInfo, SubscribeBlock, SubscribeBlockError } from '../../scanner/src/types';
import log from './log';

type IndexerOptions = {
  dbUrl: string;
  wsUrl: string;
  types?: TypeProvider;
  sync?: boolean;
  syncOptions?: SyncOptions;
};

export default class Indexer {
  // eslint-disable-next-line
  protected constructor(private readonly db: Sequelize, private readonly scanner: Scanner) {}

  static async create(options: IndexerOptions): Promise<Indexer> {
    const db = new Sequelize(options.dbUrl, {
      logging: false
    });
    await db.authenticate();
    const wsProvider = new WsProvider(options.wsUrl);

    init(db);
    if (options.sync) {
      await db.sync(options.syncOptions);
    }

    return new Indexer(db, new Scanner({ wsProvider, types: options.types }));
  }

  async start(): Promise<void> {
    const statuses = await Status.findOne({ order: [['blockNumber', 'DESC']] });
    const lastBlockNumber = statuses ? statuses.blockNumber : 0;
    await this.deleteBlocks(lastBlockNumber);

    const source$ = this.scanner.subscribe({ start: lastBlockNumber, concurrent: 200, confirmation: 4 });

    source$.subscribe(async result => {
      this.pushData(result);
    });

    source$.pipe(auditTime(4000 * 10)).subscribe(() => {
      for (const id of Object.keys(this.scanner.chainInfo)) {
        this.syncMetadata(this.scanner.chainInfo[id]);
      }
    });

    source$.pipe(auditTime(3999)).subscribe(async () => {
      const blockNumbers = await this.queryFailBlock();

      for (const number of blockNumbers) {
        await this.deleteBlock(number);
        const blockDetail = await this.getBlock(number);
        await this.pushData(blockDetail);
      }
    });
  }

  async pushData(result: SubscribeBlock | SubscribeBlockError) {
    if (result.result) {
      const t = await this.db.transaction();

      const block = result.result;
      await Promise.all([
        this.syncBlock(block, { transaction: t }),
        this.syncEvents(block, { transaction: t }),
        this.syncExtrinsics(block, { transaction: t }),
        this.syncStatus(block.number, block.hash, 0, { transaction: t })
      ])
        .then(() => {
          return t.commit();
        })
        .then(() => {
          return log.info(`${block.number}-${block.hash}`);
        })
        .catch(async error => {
          t.rollback();
          log.error(`${block.number}-${block.hash}`, error, { errorCode: 2 });
          await this.syncStatus(block.number, block.hash, 2);
        });
    } else {
      log.error(`${result.blockNumber}-unknown`, result.error, { errorCode: 1 });

      const blockNumber = result.blockNumber;
      this.syncStatus(blockNumber, null, 1);
    }
  }

  async queryFailBlock(limit: number = 10) {
    const result = await Status.findAll({
      where: { status: { [Op.not]: 0 } },
      limit,
      order: [['updatedAt', 'asc']],
      attributes: ['blockNumber']
    });
    return result.map(r => r.toJSON()).map((r: any) => Number(r.blockNumber));
  }

  async getBlock(blockNumber: number) {
    let result: SubscribeBlock | SubscribeBlockError;
    log.info(`${blockNumber} retry`);

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

  async syncEvents(block: SubscribeBlock['result'], options: any) {
    const request = [];
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
    const request = [];
    for (const extrinsic of block.extrinsics) {
      request.push(
        Extrinsic.upsert(
          {
            id: `${block.number}-${extrinsic.index}`,
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
            bytes: extrinsic.bytes
          },
          options
        )
      );
    }
    await Promise.all(request);
  }

  async syncMetadata(chainInfo: ChainInfo) {
    const find = await Metadata.findOne({
      where: {
        id: chainInfo.id
      },
      attributes: ['id', 'minBlockNumber', 'maxBlockNumber']
    });

    if (!find) {
      await Metadata.upsert({
        id: chainInfo.id,
        minBlockNumber: chainInfo.min,
        maxBlockNumber: chainInfo.max,
        bytes: chainInfo.bytes,
        json: chainInfo.metadata.metadata.toJSON(),
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
      })
    ]);
  }

  close(): void {
    this.db.close();
  }
}
