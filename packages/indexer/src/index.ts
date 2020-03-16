import Indexer from './indexer';

import { types } from '@acala-network/types';

const main = async (): Promise<void> => {
  const dbUrl = 'postgres://postgres:postgres@localhost:5432/postgres';
  const wsUrl = 'wss://node-6640517791634960384.jm.onfinality.io/ws';
  const httpUrl = 'https://node-6640517791634960384.jm.onfinality.io/rpc';
  const indexer = await Indexer.create({ dbUrl, wsUrl, httpUrl, types, sync: true });
  await indexer.start();
};

main()
.catch(err => {
    console.error(err);
});
