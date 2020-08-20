import { autorun } from 'mobx';
import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { createStorage } from '../..';

import { StorageType } from '../../__mock__/api-mobx';

describe('api-mobx', () => {
  jest.setTimeout(30_000);

  let api: ApiPromise;
  let storage: StorageType;

  beforeAll(async () => {
    const ws = new WsProvider('wss://kusama-rpc.polkadot.io/');
    api = await ApiPromise.create({ provider: ws });
    storage = createStorage(api, ws);
  }, 10_000);

  it('block hash works', (done) => {
    autorun(() => {
      const hash = storage.block.hash;
      console.dir(hash);

      if (hash != null) {
        done();
      }
    });
  });

  it('starts with null', (done) => {
    let tick = 0;
    autorun(() => {
      const parentHash = storage.system.parentHash;
      if (tick === 0) {
        expect(parentHash).toBeNull();
      } else {
        expect(parentHash).toBeTruthy();
        done();
      }
      tick++;
    });
  });

  it('account works', (done) => {
    autorun(() => {
      const alice = api.createType('AccountId', 'CtwdfrhECFs3FpvCGoiE4hwRC4UsSiM8WL899HjRdQbfYZY');
      const account = storage.system.account(alice);
      console.dir(account && account.toHuman());

      if (account) {
        done();
      }
    });
  });

  it('StorageMap works', (done) => {
    autorun(() => {
      const validators = storage.staking.validators.entries();
      console.dir([...validators.values()].map((value) => value.toHuman()));

      if (validators.size > 0) {
        done();
      }
    });
  });
});
