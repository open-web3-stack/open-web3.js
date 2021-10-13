import { ObservableMap } from 'mobx';
import memoize from 'memoizee';
import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { stringCamelCase } from '@polkadot/util';
import StateTracker from './stateTracker';
import { ObservableStorageEntry, ObservableStorageMapEntries } from './observableStorage';

export interface BaseStorageType {
  block: {
    hash: string | null;
  };
}

export interface StorageMap<Key, T> {
  (key: Key): T | null;
  entries: () => ObservableMap<string, T>;
}

export const createStorage = <T>(api: ApiPromise, ws: WsProvider): T => {
  const obj: any = {};

  const metadata = api.runtimeMetadata.asLatest;

  const tracker = new StateTracker(ws);

  for (const moduleMetadata of metadata.pallets) {
    const moduleName = stringCamelCase(moduleMetadata.name.toString());
    const storage: { [key: string]: any } = {};

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
        const accessorImpl = memoize((key: any) => {
          return new ObservableStorageEntry(api, tracker, moduleName, entryName, [key]);
        });
        const accessor: any = (key: any) => accessorImpl(key.toString()).value;
        const entries = new ObservableStorageMapEntries(api, tracker, moduleName, entryName);
        accessor.entries = () => entries.value;
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
