import { ObservableMap } from 'mobx';
import memoize from 'memoizee';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { stringCamelCase } from '@polkadot/util';
import StateTracker from './stateTracker';
import {
  ObservableStorageEntry,
  ObservableStorageMapEntries,
  ObservableStorageDoubleMapEntries
} from './observableStorage';

export interface BaseStorageType {
  block: {
    hash: string | null;
  };
}

export interface StorageMap<Key, T> {
  (key: Key): T | null;
  entries: () => ObservableMap<string, T>;
}

export interface StorageDoubleMap<Key1, Key2, T> {
  (key1: Key1, key2: Key2): T | null;
  entries: (key1: Key1) => ObservableMap<string, T>;
  allEntries: () => ObservableMap<string, ObservableMap<string, T>>;
}

const normalizer = (args: any): string => [...args].map((x) => x.toString()).join('.');

export const createStorage = <T>(api: ApiPromise, ws: WsProvider): T => {
  const obj: any = {};

  const metadata = api.runtimeMetadata.asLatest;

  const tracker = new StateTracker(ws);

  for (const moduleMetadata of metadata.modules) {
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
        const accessorImpl = memoize(
          (key: any) => {
            return new ObservableStorageEntry(api, tracker, moduleName, entryName, [key]);
          },
          { normalizer }
        );
        const accessor: any = (key: any) => accessorImpl(key).value;
        const entries = new ObservableStorageMapEntries(api, tracker, moduleName, entryName);
        accessor.entries = () => entries.value;
        storage[entryName] = accessor;
      } else if (type.isDoubleMap) {
        const accessorImpl = memoize(
          (key1: any, key2: any) => {
            return new ObservableStorageEntry(api, tracker, moduleName, entryName, [key1, key2]);
          },
          { normalizer }
        );
        const accessor: any = (key1: any, key2: any) => accessorImpl(key1, key2).value;
        const entries = new ObservableStorageMapEntries(api, tracker, moduleName, entryName);
        const entriesImpl = memoize(
          (key: any) => {
            return new ObservableStorageDoubleMapEntries(api, tracker, moduleName, entryName, key);
          },
          { normalizer }
        );
        accessor.entries = (key1: any) => entriesImpl(key1).value.get(key1);
        accessor.allEntries = () => entries.value;
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
