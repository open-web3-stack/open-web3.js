import { ObservableMap } from 'mobx';
import { computedFn } from 'mobx-utils';
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
        const accessorImpl = computedFn((key: any) => {
          return new ObservableStorageEntry(api, tracker, moduleName, entryName, [key]);
        });
        const accessor: any = (key: any) => accessorImpl(key.toString()).value;
        const entries = new ObservableStorageMapEntries(api, tracker, moduleName, entryName);
        accessor.entries = () => entries.value;
        storage[entryName] = accessor;
      } else if (type.isDoubleMap) {
        const accessorImpl = computedFn((key1: any, key2: any) => {
          return new ObservableStorageEntry(api, tracker, moduleName, entryName, [key1, key2]);
        });
        const accessor: any = (key1: any, key2: any) => accessorImpl(key1.toString(), key2.toString()).value;
        const entries = new ObservableStorageMapEntries(api, tracker, moduleName, entryName);
        const entriesImpl = computedFn((key: any) => {
          return new ObservableStorageDoubleMapEntries(api, tracker, moduleName, entryName, key);
        });
        accessor.entries = (key1: any) => entriesImpl(key1.toString()).value.get(key1.toString());
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
