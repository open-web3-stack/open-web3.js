import { Sequelize, SyncOptions } from 'sequelize';
import init, { Status } from './models';
import Scanner from '../../scanner/src';
import { WsProvider } from '@polkadot/rpc-provider';
import { TypeProvider } from '../../scanner/src/types';

type IndexerOptions = {
  dbUrl: string;
  apiUrl: string;
  types?: TypeProvider;
  sync?: boolean;
  syncOptions?: SyncOptions;
}

export default class Indexer {
  // eslint-disable-next-line
  protected constructor(private readonly db: Sequelize, private readonly scanner: Scanner) {
  }

  static async create(options: IndexerOptions): Promise<Indexer> {
    const db = new Sequelize(options.dbUrl);
    await db.authenticate();
    const provider = new WsProvider(options.apiUrl);
    init(db);
    if (options.sync) {
      await db.sync(options.syncOptions);
    }
    return new Indexer(db, new Scanner({ provider, types: options.types }));
  }

  async start(): Promise<void> {
    const [status] = await Status.findOrBuild({ where: { id: 0 }, defaults: { id: 0 } });
    const block = status.lastBlock;
    this.scanner.subscribe({ start: block }).subscribe(block => {
      console.log(block);
    });
  }

  close(): void {
    this.db.close();
  }
}
