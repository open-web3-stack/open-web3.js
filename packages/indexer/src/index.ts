import Indexer from './indexer';
import dotenv from 'dotenv';
import { options } from '@laminar/api';
import { types as acalaTypes } from '@acala-network/types';
import log from './log';

dotenv.config();

const runAcalaNetwork = async (): Promise<void> => {
  const dbUrl = process.env.ACALA_DB_URI as string;
  const wsUrl = process.env.ACALA_WS_URL || 'wss://node-6640517791634960384.jm.onfinality.io/ws';
  const indexer = await Indexer.create({ dbUrl, wsUrl, types: acalaTypes, sync: true });
  await indexer.start();
};

const runLaminarNetwork = async (): Promise<void> => {
  const dbUrl = process.env.LAMINAR_DB_URI as string;
  const wsUrl = process.env.LAMINAR_WS_URL || 'wss://testnet-node-1.laminar-chain.laminar.one/ws';
  const indexer = await Indexer.create({ dbUrl, wsUrl, types: options({}).types, sync: true });
  await indexer.start();
};

if (process.env.NETWORK === 'acala') {
  log.info('run acala');
  runAcalaNetwork().catch(err => {
    log.error(err);
  });
} else if (process.env.NETWORK === 'laminar') {
  log.info('run laminar');
  runLaminarNetwork().catch(err => {
    log.error(err);
  });
}
