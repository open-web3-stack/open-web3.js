import { autorun } from 'mobx';
import { computedFn } from 'mobx-utils';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { AugmentedQueries } from '@polkadot/api/types/storage';
import { stringCamelCase } from '@polkadot/util';
import StateTracker from './stateTracker';
import {
  ObservableStorageEntry,
  ObservableStorageMapEntries,
  ObservableStorageDoubleMapEntries
} from './observableStorage';

type RootType = AugmentedQueries<'promise'>;

type StorageType = {
  [ModuleKey in keyof RootType]: {
    [ItemKey in keyof RootType[ModuleKey]]: any;
  };
} & {
  block: {
    hash: string | null;
  };
};

export const createStorage = (api: ApiPromise, ws: WsProvider): StorageType => {
  const obj: any = {};

  const metadata = api.runtimeMetadata.asLatest;

  const tracker = new StateTracker(ws);

  for (const moduleMetadata of metadata.modules) {
    const moduleName = stringCamelCase(moduleMetadata.name.toString());
    const storage = {};

    for (const entry of moduleMetadata.storage.unwrapOrDefault().items) {
      const type = entry.type;
      const entryName = stringCamelCase(entry.name.toString());
      if (type.isPlain) {
        const val = new ObservableStorageEntry(api, tracker, moduleName, entryName);
        Object.defineProperty(storage, entryName, {
          configurable: false,
          enumerable: true,
          get: () => val.value
        });
      } else if (type.isMap) {
        const accessorImpl = computedFn((key: any) => {
          return new ObservableStorageEntry(api, tracker, moduleName, entryName, [key]);
        });
        const accessor: any = (key: any) => accessorImpl(key).value;
        const entries = new ObservableStorageMapEntries(api, tracker, moduleName, entryName);
        accessor.entries = () => entries.value;
        storage[entryName] = accessor;
      } else if (type.isDoubleMap) {
        const accessorImpl = computedFn((key1: any, key2: any) => {
          return new ObservableStorageEntry(api, tracker, moduleName, entryName, [key1, key2]);
        });
        const accessor: any = (key1: any, key2: any) => accessorImpl(key1, key2).value;
        const entries = new ObservableStorageMapEntries(api, tracker, moduleName, entryName);
        const entriesImpl = computedFn((key: any) => {
          return new ObservableStorageDoubleMapEntries(api, tracker, moduleName, entryName, key);
        });
        accessor.entries = (key?: any) => (key === undefined ? entries.value : entriesImpl(key).value);
        storage[entryName] = accessor;
      }
    }

    obj[moduleName] = storage;
  }

  obj.block = {
    get hash() {
      return tracker.blockHash;
    }
  };

  return obj;
};

async function main() {
  // const ws = new WsProvider('wss://kusama-rpc.polkadot.io/');
  const ws = new WsProvider('ws://localhost:9944/');
  const api = await ApiPromise.create({ provider: ws });
  const storage = createStorage(api, ws);
  autorun((r) => {
    r.trace();
    const hash = storage.block.hash;
    const accounts = storage.system.account.entries();
    // const events = storage.system.events;
    // const stakers = storage.staking.erasStakers(1, '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY');
    console.dir(
      {
        hash,
        account: [...accounts.values()].map(([key, value]) => [key.toString(), value.toHuman()])
        // stakers: stakers?.toHuman()
      },
      { depth: 5 }
    );
  });
}

if (require.main === module) {
  main();
}
