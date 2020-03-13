import { Sequelize, SyncOptions } from 'sequelize';
import init, { Status, Block, Metadata, Extrinsic, Events } from './models';
import Scanner from '../../scanner/src';
import { WsProvider, HttpProvider } from '@polkadot/rpc-provider';
import { TypeProvider, ChainInfo, SubscribeBlock } from '../../scanner/src/types';

type IndexerOptions = {
  dbUrl: string;
  wsUrl: string;
  httpUrl: string;
  types?: TypeProvider;
  sync?: boolean;
  syncOptions?: SyncOptions;
};

export default class Indexer {
  // eslint-disable-next-line
  protected constructor(private readonly db: Sequelize, private readonly scanner: Scanner) {}

  static async create(options: IndexerOptions): Promise<Indexer> {
    const db = new Sequelize(options.dbUrl);
    await db.authenticate();
    const wsProvider = new WsProvider(options.wsUrl);
    const rpcProvider = new HttpProvider(options.httpUrl);
    console.log(rpcProvider)
    init(db);
    if (options.sync) {
      await db.sync(options.syncOptions);
    }
    return new Indexer(db, new Scanner({ wsProvider, rpcProvider: wsProvider, types: options.types }));
  }

  async start(): Promise<void> {
    const [status] = await Status.findOrBuild({ where: { id: 0 }, defaults: { id: 0 } });
    const block = status.lastBlockNumber;
    console.log(block)
    this.scanner.subscribe({ start: 64000, concurrent: 1000 }).subscribe(block => {
      this.syncBlock(block);
      this.syncEvents(block);
      this.syncExtrinsics(block);
      this.syncMetadata(block.chainInfo);
    });
  }

  async syncEvents(block: SubscribeBlock) {
    const request = [];
    for (const event of block.events) {
      request.push(
        Events.upsert({
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
        })
      );
    }
    await Promise.all(request);
  }

  async syncBlock(block: SubscribeBlock) {
    await Block.upsert({
      hash: block.hash,
      number: block.number,
      parentHash: block.raw.block.header.parentHash,
      author: block.author,
      raw: block.raw
    });
  }

  async syncExtrinsics(block: SubscribeBlock) {
    const request = [];
    for (const extrinsic of block.extrinsics) {
      request.push(
        Extrinsic.upsert({
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
        })
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
      await Metadata.create({
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

  close(): void {
    this.db.close();
  }
}
