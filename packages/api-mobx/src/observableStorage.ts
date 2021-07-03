import { createAtom, ObservableMap, observable, transaction } from 'mobx';
import { Atom } from 'mobx/lib/core/atom';
import { ApiPromise } from '@polkadot/api';
import { StorageKey } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import { u8aToHex, hexToU8a, u8aToU8a } from '@polkadot/util';
import { getType } from './getType';

import StateTracker from './stateTracker';

const createMap = (name: string) => {
  return observable.map({}, { deep: false, name });
};

const isTreatAsHex = (key: string): boolean => {
  // :code is problematic - it does not have the length attached, which is
  // unlike all other storage entries where it is indeed properly encoded
  return ['0x3a636f6465'].includes(key);
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

    const key = storageEntry.key(...this._keys.map((x) => u8aToU8a(x)));
    this._unsub = this._tracker.trackKey(key, (key, value) => {
      const { isEmpty, fallback, modifier } = storageEntry.creator.meta;
      const input = isEmpty ? (fallback ? hexToU8a(fallback.toHex()) : undefined) : value;
      if (input == null) {
        this._value = null;
      } else {
        const type = getType(storageEntry.creator);
        const formatted = this._api.createType(type, isTreatAsHex(key) ? input : u8aToU8a(input));
        if (modifier.isOptional) {
          this._value = new Option(this._api.registry, type, formatted);
        } else {
          this._value = formatted;
        }
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

      const { isEmpty, fallback, modifier } = storageEntry.creator.meta;
      const input = isEmpty ? (fallback ? hexToU8a(fallback.toHex()) : undefined) : value;

      if (key2) {
        if (input == null) {
          const values = this._value.get(key1);
          if (values) {
            values.delete(key2);
            this._value.set(key1, values);
          }
        } else {
          const name = `${this._module}.${this._entry}.entries().${key1}.${key2}`;
          const values = this._value.get(key1) || createMap(name);
          const type = getType(storageEntry.creator);

          const formatted = this._api.createType(type, isTreatAsHex(key) ? input : u8aToU8a(input));
          if (modifier.isOptional) {
            values.set(key2, new Option(this._api.registry, type, formatted));
          } else {
            values.set(key2, formatted);
          }
          this._value.set(key1, values);
        }
      } else {
        if (input == null) {
          this._value.delete(key1);
        } else {
          const type = getType(storageEntry.creator);
          const formatted = this._api.createType(type, isTreatAsHex(key) ? input : u8aToU8a(input));
          if (modifier.isOptional) {
            this._value.set(key1, new Option(this._api.registry, type, formatted));
          } else {
            this._value.set(key1, formatted);
          }
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
    const name = `${_module}.${_entry}.entries(${_key.toString()})`;
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
          const name = `${this._module}.${this._entry}.entries(${key1}).${key2}`;
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
      const { isEmpty, fallback, modifier } = storageEntry.creator.meta;
      const input = isEmpty ? (fallback ? hexToU8a(fallback.toHex()) : undefined) : value;
      if (input == null) {
        this._value.delete(key1);
      } else {
        const name = `${this._module}.${this._entry}.entries(${key1}).${key2}`;
        const values = this._value.get(key1) || createMap(name);
        const type = getType(storageEntry.creator);
        const formatted = this._api.createType(type, isTreatAsHex(key) ? input : u8aToU8a(input));
        if (modifier.isOptional) {
          values.set(key2, new Option(this._api.registry, type, formatted));
        } else {
          values.set(key2, formatted);
        }
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
