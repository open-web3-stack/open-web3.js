import { createAtom, ObservableMap, observable, transaction } from 'mobx';
import { Atom } from 'mobx/lib/core/atom';
import { ApiPromise } from '@polkadot/api';
import { StorageKey } from '@polkadot/types';
import { u8aToHex, hexToU8a } from '@polkadot/util';

import StateTracker from './stateTracker';

const createMap = (name: string) => {
  return observable.map({}, { deep: false, name });
};

export class ObservableStorageEntry {
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
    const name = [_module, _entry, ..._keys].join('.');
    this._atom = createAtom(
      name,
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
      if (value == null) {
        this._value = null;
      } else {
        const type = StorageKey.getType(storageEntry.creator);
        this._value = this._api.createType(type as any, hexToU8a(value));
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

export class ObservableStorageMapEntries {
  private readonly _atom: Atom;
  private _value: ObservableMap;
  private _unsub: () => any = () => {};

  public constructor(
    private readonly _api: ApiPromise,
    private readonly _tracker: StateTracker,
    private readonly _module: string,
    private readonly _entry: string
  ) {
    const name = `${_module}.${_entry}.entries()`;
    this._atom = createAtom(
      name,
      () => this._start(),
      () => this._stop()
    );

    this._value = createMap(name);
  }

  private _start() {
    const storageEntry = this._api.query[this._module][this._entry];

    // fetch initial value
    storageEntry.entries().then((val) => {
      transaction(() => {
        for (const [storageKey, value] of val) {
          const [key1, key2] = storageKey.args.map((i) => i.toString());
          if (key2) {
            const name = `${this._module}.${this._entry}.entries().${key1}.${key2}`;
            const values = this._value.get(key1) || createMap(name);
            values.set(key2, value);
            this._value.set(key1, values);
          } else {
            this._value.set(key1, value);
          }
        }
      });
    });

    const prefix = storageEntry.keyPrefix();
    this._unsub = this._tracker.trackPrefix(prefix, (key, value) => {
      const decodedKey = new StorageKey(this._api.registry, key);
      decodedKey.setMeta(storageEntry.creator.meta);
      const [key1, key2] = decodedKey.args.map((i) => i.toString());

      if (key2) {
        if (value == null) {
          const values = this._value.get(key1);
          if (values) {
            values.delete(key2);
            this._value.set(key1, values);
          }
        } else {
          const name = `${this._module}.${this._entry}.entries().${key1}.${key2}`;
          const values = this._value.get(key1) || createMap(name);
          let type = StorageKey.getType(storageEntry.creator);
          const isOptional = storageEntry.creator.meta.modifier.isOptional;
          if (isOptional) {
            type = `Option<${type}>`;
          }
          values.set(key2, this._api.createType(type as any, value));
          this._value.set(key1, values);
        }
      } else {
        if (value == null) {
          this._value.delete(key1);
        } else {
          const type = StorageKey.getType(storageEntry.creator);
          this._value.set(key1, this._api.createType(type as any, hexToU8a(value)));
        }
      }
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

export class ObservableStorageDoubleMapEntries {
  private readonly _atom: Atom;
  private _value: ObservableMap;
  private _unsub: () => any = () => {};

  public constructor(
    private readonly _api: ApiPromise,
    private readonly _tracker: StateTracker,
    private readonly _module: string,
    private readonly _entry: string,
    private readonly _key: any
  ) {
    const name = `${_module}.${_entry}.entries(${_key})`;
    this._atom = createAtom(
      name,
      () => this._start(),
      () => this._stop()
    );

    this._value = createMap(name);
  }

  private _start() {
    const storageEntry = this._api.query[this._module][this._entry];

    // fetch initial value
    storageEntry.entries(this._key).then((val) => {
      transaction(() => {
        for (const [storageKey, value] of val) {
          const [key1, key2] = storageKey.args.map((i) => i.toString());
          const name = `${this._module}.${this._entry}.entries(${this._key}).${key2}`;
          const values = this._value.get(key1) || createMap(name);
          values.set(key2, value);
          this._value.set(key1, values);
        }
      });
    });

    const prefix = u8aToHex(storageEntry.creator.keyPrefix(this._key));
    this._unsub = this._tracker.trackPrefix(prefix, (key, value) => {
      const decodedKey = new StorageKey(this._api.registry, key);
      decodedKey.setMeta(storageEntry.creator.meta);
      const [key1, key2] = decodedKey.args.map((i) => i.toString());
      if (value == null) {
        this._value.delete(key1);
      } else {
        const name = `${this._module}.${this._entry}.entries(${this._key}).${key2}`;
        const values = this._value.get(key1) || createMap(name);
        let type = StorageKey.getType(storageEntry.creator);
        const isOptional = storageEntry.creator.meta.modifier.isOptional;
        if (isOptional) {
          type = `Option<${type}>`;
        }
        values.set(key2, this._api.createType(type as any, hexToU8a(value)));
        this._value.set(key1, values);
      }
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
