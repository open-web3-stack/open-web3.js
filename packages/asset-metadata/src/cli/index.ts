#!/usr/bin/env node

import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { Keyring } from '@polkadot/keyring';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { AssetMetadata } from '../index';

const {
  _: [method, ...params],
  metadata: metadataFile,
  seed,
  types: typesFile,
  ws
} = yargs
  .command(
    '$0',
    `Usage: [options] <methodName> <...params>
Example: freeBalance 12jXX8aU8QGRrc9zb2vgVdtSnnTsqKZjf3sKYK8haFcPdpr9 --metadata dot.json
Example: transfer 12jXX8aU8QGRrc9zb2vgVdtSnnTsqKZjf3sKYK8haFcPdpr9 10000 --metadata dot.json --seed "//Alice"`
  )
  .wrap(120)
  .options({
    seed: {
      description: 'The account seed to use (required for tx.* only)',
      type: 'string'
    },
    ws: {
      description: 'The API endpoint to connect to, e.g. wss://kusama-rpc.polkadot.io',
      type: 'string'
    },
    metadata: {
      description: 'The local file path of the asset metadata',
      type: 'string'
    },
    types: {
      description: 'Specify the chain to parse the json file of types required for metadata.',
      type: 'string'
    }
  })
  .parserConfiguration({
    'parse-numbers': false
  }).argv;

function makeCall(fn: any) {
  return fn(...params).then((result) => {
    console.log(result.toString());
  });
}

function makeTx(fn: any) {
  if (!seed) {
    throw new Error('You need to specify the seed to complete the transaction');
  }
  const keyring = new Keyring();
  const auth = keyring.createFromUri(seed, {}, 'sr25519');

  return fn(...params).signAndSend(auth, (result: any): void => {
    console.log(JSON.stringify(result.toHuman(), null, 2));

    if (result.isInBlock || result.isFinalized) {
      process.exit(0);
    }
  });
}

async function run() {
  if (!metadataFile) {
    throw new Error('Require asset metadata path');
  }

  const metadata = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), metadataFile), 'utf8'));

  const provider = new WsProvider(ws || metadata.url);

  const types = typesFile ? JSON.parse(fs.readFileSync(path.resolve(process.cwd(), typesFile), 'utf8')) : {};
  const api = new ApiPromise({
    provider,
    types: {
      ...types,
      ...metadata.types
    }
  });

  const assetMetadata = new AssetMetadata(api, metadata);
  const fn = assetMetadata[method];

  await api.isReady;

  if (!fn) {
    throw new Error(`Cannt find method ${method}`);
  }

  if (method === 'transfer') {
    return makeTx(fn);
  } else {
    return makeCall(fn);
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error): void => {
    console.error(error);
    process.exit(1);
  });
