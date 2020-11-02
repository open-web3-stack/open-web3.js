import { WsProvider } from '@polkadot/rpc-provider';
import { ApiPromise } from '@polkadot/api';
import Scanner from './Scanner';
import { types, typesBundle } from '@acala-network/type-definitions';

function run() {
  const provider = new WsProvider('ws://192.168.1.165:9944');
  const scanner = new Scanner({
    wsProvider: provider,
    types: types,
    typesBundle: typesBundle as any
  });

  scanner
    .subscribe({
      start: 0,
      end: 1000,
      concurrent: 1
    })
    .subscribe((no) => {
      console.log(no?.result?.events);
    });
}

async function acala() {
  const api = new ApiPromise({
    provider: new WsProvider('ws://192.168.1.165:9944'),
    types: types,
    typesBundle: typesBundle as any
  });

  await api.isReady;

  const data = await api.query.system.events.at('0x64d55d43578aa7e6748d90021327b60eddcaf11af093c13e6f5ddb065481899d');

  console.log(data);
}

run();
