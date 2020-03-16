import Indexer from './indexer';
import dotenv from 'dotenv';

import { types } from '@acala-network/types';

dotenv.config();

const main = async (): Promise<void> => {
  const dbUrl = process.env.DB_URI as string;
  const wsUrl = 'wss://node-6640517791634960384.jm.onfinality.io/ws';
  const httpUrl = 'https://node-6640517791634960384.jm.onfinality.io/rpc';
  const indexer = await Indexer.create({ dbUrl, wsUrl, httpUrl, types, sync: true });
  await indexer.start();
};

main().catch(err => {
  console.error(err);
});
