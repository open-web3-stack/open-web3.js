import Indexer from './indexer';
import dotenv from 'dotenv';
import { options } from '@laminar/api';
import { types as acalaTypes } from '@acala-network/types';

dotenv.config();

const runAcalaNetwork = async (): Promise<void> => {
  const dbUrl = process.env.ACALA_DB_URI as string;
  const wsUrl = 'wss://node-6640517791634960384.jm.onfinality.io/ws';
  const indexer = await Indexer.create({ dbUrl, wsUrl, types: acalaTypes, sync: true });
  await indexer.start();
};

const runLaminarNetwork = async (): Promise<void> => {
  const dbUrl = process.env.LAMINAR_DB_URI as string;
  const wsUrl = 'wss://node-6636393196323627008.jm.onfinality.io/ws?apikey=20cf0fa0-c7ee-4545-8227-4d488f71c6d2';
  const indexer = await Indexer.create({ dbUrl, wsUrl, types: options({}).types, sync: true });
  await indexer.start();
};

if (process.env.NETWORK === 'acala') {
  console.log('run acala');
  runAcalaNetwork().catch(err => {
    console.error(err);
  });
} else if (process.env.NETWORK === 'laminar') {
  console.log('run laminar');
  runLaminarNetwork().catch(err => {
    console.error(err);
  });
}
