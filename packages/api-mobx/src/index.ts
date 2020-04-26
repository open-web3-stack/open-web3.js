import { IObservableObject, createAtom, autorun } from 'mobx';
import { createTransformer } from 'mobx-utils';
import { Atom } from 'mobx/lib/core/atom';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { AugmentedQueries } from '@polkadot/api/types/storage';
import { stringCamelCase } from '@polkadot/util';

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
    const accessor: (...args: any[]) => Promise<() => any> = this._api.query[this._module][this._entry] as any;
    accessor(...this._keys, (val) => {
      this._value = val;
      this._atom.reportChanged();
    }).then((unsub) => {
      this._unsub = unsub;
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

export const createStorage = (api: ApiPromise): StorageType => {
  const obj: any = {};

  const metadata = api.runtimeMetadata.asLatest;

  for (const moduleMetadata of metadata.modules) {
    const moduleName = stringCamelCase(moduleMetadata.name.toString());
    const storage = {};

    for (const entry of moduleMetadata.storage.unwrapOrDefault().items) {
      const type = entry.type;
      const entryName = stringCamelCase(entry.name.toString());
      if (type.isPlain) {
        const val = new ObservableStorageEntry(api, moduleName, entryName);
        Object.defineProperty(storage, entryName, {
          configurable: false,
          enumerable: true,
          get: () => val.value
        });
      } else if (type.isMap) {
        const accessor = createTransformer((key: any) => {
          return new ObservableStorageEntry(api, moduleName, entryName, [key]).value;
        });
        storage[entryName] = accessor;
      } else if (type.isDoubleMap) {
        const accessorImpl = createTransformer((keys: any) => {
          return new ObservableStorageEntry(api, moduleName, entryName, keys).value;
        });
        const accessor = (key1: any, key2: any) => accessorImpl([key1, key2]);
        storage[entryName] = accessor;
      }
    }

    obj[moduleName] = storage;
  }

  return obj;
};

async function main() {
  const ws = new WsProvider('wss://kusama-rpc.polkadot.io/');
  const api = await ApiPromise.create({ provider: ws, types: { BountyIndex: 'u32' } });
  const storage = createStorage(api);
  autorun(() => {
    const val = storage.system.account('E346pvnjqJrMhP34GGskn4HU9w6WQmrtvtpJA66xDj3Tq68');
    const val2 = storage.staking.erasStakers(713, 'FSETB7JeTuTsJBYzUcKBtHXBYtBft3pZ87FUxP2GaY4acFh');
    const val3 = storage.balances.totalIssuance;
    if (val && val2 && val3) {
      console.log(val.toHuman(), val2.toHuman(), val3.toHuman());
    }
  });
}

main();
