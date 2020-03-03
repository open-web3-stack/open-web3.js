import { Sequelize } from 'sequelize';
import init, { Status } from './models';
import Scanner from '@orml/scanner';
import { WsProvider } from '@polkadot/rpc-provider';
import { TypeProvider } from '@orml/scanner/types';

export default class Indexer {
  // eslint-disable-next-line
  protected constructor(private readonly db: Sequelize, private readonly scanner: Scanner) {
  }

  static async create(dbUrl: string, apiUrl: string, types?: TypeProvider): Promise<Indexer> {
    const db = new Sequelize(dbUrl);
    await db.authenticate();
    const provider = new WsProvider(apiUrl);
    await init(db, { force: true });
    return new Indexer(db, new Scanner({ provider, types }));
  }

  async start(): Promise<void> {
    const [status] = await Status.findOrBuild({ where: { id: 0 }, defaults: { lastBlock: 0 } });
    const block = status.lastBlock;
    this.scanner.subscribe({ start: block }).subscribe(block => {
      console.log(block);
    });
  }

  close(): void {
    this.db.close();
  }
}
