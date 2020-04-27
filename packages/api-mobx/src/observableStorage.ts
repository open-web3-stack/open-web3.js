import { createAtom, ObservableMap, observable, transaction } from 'mobx';
import { Atom } from 'mobx/lib/core/atom';
import { ApiPromise } from '@polkadot/api';
import { StorageKey } from '@polkadot/types';
import StateTracker from './stateTracker';

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
    this._atom = createAtom(
      `${_module}.${_entry}`,
      () => this._start(),
      () => this._stop()
    );

    this._value = observable.map({}, { deep: false, name: `${_module}.${_entry}.entries` });
  }

  private _start() {
    const storageEntry = this._api.query[this._module][this._entry];

    // fetch initial value
    storageEntry.entries().then((val) => {
      transaction(() => {
        for (const [key, value] of val) {
          this._value.set(key.toHex(), [key.args[0], value]);
        }
      });
    });

    const prefix = storageEntry.keyPrefix();
    this._unsub = this._tracker.trackPrefix(prefix, (key, value) => {
      const decodedKey = new StorageKey(this._api.registry, key);
      decodedKey.setMeta(storageEntry.creator.meta);
      if (value == null) {
        this._value.delete(key);
      } else {
        const type = StorageKey.getType(storageEntry.creator);
        this._value.set(key, [decodedKey.args[0], this._api.createType(type as any, value)]);
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
