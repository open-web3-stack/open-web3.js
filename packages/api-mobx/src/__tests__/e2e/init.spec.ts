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
  });

  it('block hash works', (done) => {
    autorun(() => {
      const hash = storage.block.hash;
      hash && console.dir(hash);

      if (hash) {
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
      account && console.dir(account.toHuman());

      if (account) {
        done();
      }
    });
  });

  it('StorageMap entries works', (done) => {
    autorun(() => {
      const validators = storage.staking.validators.entries();
      console.log(validators.keys());
      console.dir([...validators.values()].map((value) => value.toHuman()));

      if (validators.size > 0) {
        done();
      }
    });
  });


  it('StorageMap with key works', (done) => {
    autorun(() => {
      const validator = storage.staking.validators('HYxzaXwkydDNAy3R8UnCvfprNm74TwwSELpyXSRoqmy9AQY');
      validator && console.log(validator.toHuman());

      if (validator) {
        done();
      }
    });
  });

  it('StorageDoubleMap allEntries works', (done) => {
    autorun(() => {
      let result = storage.staking.erasValidatorPrefs.allEntries();
      const keys = Array.from(result.keys());
      const values = Array.from(result.values());
      if (keys.length > 0) {
        console.log(keys[0]);
        for (const rawValue of values[0]) {
          for (const [key, value] of rawValue.entries()) {
            console.log(key, value.toString());
            done();
            return;
          }
        }
      }
    });
  }, 60000);

  it('StorageDoubleMap with key1 works', (done) => {
    autorun(() => {
      let result = storage.staking.erasValidatorPrefs.entries(2421);
      if (result) {
        const keys = Array.from(result.keys());
        const values = Array.from(result.entries());
        const [key, value] = values[0];
        console.log(key, value.toString());

        if (keys.length > 0) {
          console.log(keys[0]);
          done();
        }
      }
    });
  });

  it('StorageDoubleMap with key1 & key2 works', (done) => {
    autorun(() => {
      let result = storage.staking.erasValidatorPrefs(0, 'CtwdfrhECFs3FpvCGoiE4hwRC4UsSiM8WL899HjRdQbfYZY');
      result && console.log(result.toJSON());
      if (result) {
        done();
      }
    });
  });
});
