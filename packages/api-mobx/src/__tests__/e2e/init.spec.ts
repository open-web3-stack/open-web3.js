import { autorun } from 'mobx';
import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { createStorage, BaseStorageType } from '../..';

import { StorageType } from '../../__mock__/api-mobx';

describe('api-mobx', () => {
  let storage: BaseStorageType & StorageType;

  beforeAll(async () => {
    const ws = new WsProvider('wss://kusama-rpc.polkadot.io/');
    const api = await ApiPromise.create({ provider: ws });
    storage = createStorage<StorageType>(api, ws);
  }, 10_000);

  it('block hash works', (done) => {
    autorun(() => {
      const hash = storage.block.hash;
      console.dir(hash);

      if (hash != null) {
        done();
      }
    });
  }, 30_000);

  it('account works', (done) => {
    autorun(() => {
      const account = storage.system.account('CtwdfrhECFs3FpvCGoiE4hwRC4UsSiM8WL899HjRdQbfYZY');
      console.dir(account && account.toHuman());

      if (account) {
        done();
      }
    });
  }, 30_000);

  it('StorageMap works', (done) => {
    autorun(() => {
      const validators = storage.staking.validators.entries();
      console.dir([...validators.values()].map((value) => value.toHuman()));

      if (validators.size > 0) {
        done();
      }
    });
  }, 30_000);
});
