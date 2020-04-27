import { IObservableObject, createAtom, autorun } from 'mobx';
import { computedFn } from 'mobx-utils';
import { Atom } from 'mobx/lib/core/atom';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { AugmentedQueries } from '@polkadot/api/types/storage';
import { stringCamelCase } from '@polkadot/util';
import StateTracker from './stateTracker';
import { StorageKey } from '@polkadot/types';

type RootType = AugmentedQueries<'promise'>;

type StorageType = {
  [ModuleKey in keyof RootType]: {
    [ItemKey in keyof RootType[ModuleKey]]: any;
  } &
    IObservableObject;
};

class ObservableStorageEntry {
  private readonly _atom: Atom;
  private _value: any = null;
  private _unsub: () => any = () => {};

  public constructor(
    private readonly _api: ApiPromise,
    private readonly _tracker: StateTracker,
    private readonly _module: string,
    private readonly _entry: string,
    private readonly _keys: any[] = []
  ) {
    this._atom = createAtom(
      `${_module}.${_entry}`,
      () => this._start(),
      () => this._stop()
    );
  }

  private _start() {
    const storageEntry = this._api.query[this._module][this._entry];

    // fetch initial value
    storageEntry(...this._keys).then((val) => {
      this._value = val;
      this._atom.reportChanged();
    });

    const key = storageEntry.key(...this._keys);
    this._unsub = this._tracker.trackKey(key, (key, value) => {
      console.log(value);
      if (value == null) {
        this._value = null;
      } else {
        const type = StorageKey.getType(storageEntry.creator);
        this._value = this._api.createType(type as any, value);
      }
      this._atom.reportChanged();
    });
  }

  private _stop() {
    this._unsub();
  }

  public get value() {
    this._atom.reportObserved();
    return this._value;
  }
}

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
        const accessor = (key: any) => accessorImpl(key).value;
        storage[entryName] = accessor;
      } else if (type.isDoubleMap) {
        const accessorImpl = computedFn((key1: any, key2: any) => {
          return new ObservableStorageEntry(api, tracker, moduleName, entryName, [key1, key2]);
        });
        const accessor = (key1: any, key2: any) => accessorImpl(key1, key2).value;
        storage[entryName] = accessor;
      }
    }

    obj[moduleName] = storage;
  }

  return obj;
};

async function main() {
  const ws = new WsProvider('wss://kusama-rpc.polkadot.io/');
  const api = await ApiPromise.create({ provider: ws });
  const storage = createStorage(api, ws);
  autorun((r) => {
    r.trace();
    const account = storage.system.account('E346pvnjqJrMhP34GGskn4HU9w6WQmrtvtpJA66xDj3Tq68');
    const events = storage.system.events;
    const stakers = storage.staking.erasStakers(713, 'FSETB7JeTuTsJBYzUcKBtHXBYtBft3pZ87FUxP2GaY4acFh');
    console.log({
      account: account?.toHuman(),
      events: events?.toHuman(),
      stakers: stakers?.toHuman()
    });
  });
}

main();
