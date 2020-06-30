import { autorun } from 'mobx';
import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { createStorage, StorageType } from '../..';

let storage: StorageType;

beforeAll(async () => {
  const ws = new WsProvider('wss://kusama-rpc.polkadot.io/');
  const api = await ApiPromise.create({ provider: ws });
  storage = createStorage(api, ws);
}, 10_000);

it('works', (done) => {
  let i = 0;
  autorun(() => {
    const hash = storage.block.hash;
    const accounts = storage.system.account.entries();
    console.dir({
      hash,
      account: [...accounts.values()].map(([key, value]) => ({ [key.toString()]: value.toHuman() }))
    });

    if (i === 0) {
      expect(accounts.size).toBe(0);
    } else {
      expect(accounts.size).toBeGreaterThan(0);
      done();
    }
    i++;
  });
}, 30_000);
