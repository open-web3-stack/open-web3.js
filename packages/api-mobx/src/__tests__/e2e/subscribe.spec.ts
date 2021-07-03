import { autorun } from 'mobx';
import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { options } from '@acala-network/api';
import { StorageType } from '@acala-network/types';
import { createStorage } from '../..';

describe('acala-storage', () => {
  jest.setTimeout(30_000);

  let apiManager: ApiPromise;
  let storage: StorageType;

  beforeAll(async () => {
    const provider = new WsProvider('wss://acala-mandala.api.onfinality.io/public-ws');
    apiManager = await ApiPromise.create({provider, ...options() as any});
    
    storage = createStorage(apiManager, provider);
  });

  it('subscribes to storage', (done) => {
    let i = 0;
    autorun(() => {
      const result = storage.timestamp.now;
      result && ++i && console.log(result.toString());

      if(i > 2) {
        done();
      }
    });
  });

  it('subscribes to optional StorageMap', (done) => {
    let i = 0;
    autorun(() => {
      const result = storage.cdpEngine.debitExchangeRate.entries();
      result && ++i && console.log(Array.from(result.keys()), Array.from(result.values()).map(x => x.toString()));

      if(i > 2) {
        done();
      }
    });
  });

  it('subscribes to optional StorageMap with key', (done) => {
    let i = 0;
    let rentbc = apiManager.createType('CurrencyId', {token:"RENBTC"});
    autorun(() => {
      const result = storage.cdpEngine.debitExchangeRate(rentbc.toHex());
      result && ++i && console.log(result.toString());

      if(i > 2) {
        done();
      }
    });
  });

  it('subscribes to system events', (done) => {
    let i = 0;
    autorun(() => {
      const result = storage.system.events;
      result && ++i && console.log(result.toString());

      if(i > 2) {
        done();
      }
    });
  });
});
