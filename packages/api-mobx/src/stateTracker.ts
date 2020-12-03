import { transaction, createAtom } from 'mobx';
import { Atom } from 'mobx/lib/core/atom';
import { WsProvider } from '@polkadot/rpc-provider';
import subscribeStorage from './rpc';

export type Callback = (key: string, valueHex: string) => void;

export default class StateTracker {
  private readonly _trackKeys: Record<string, Callback[]> = {};
  private readonly _trackPrefixes: Record<string, Callback[]> = {};
  private _callabcksCount = 0;
  private _unsub = () => {};

  private readonly _blockHashAtom: Atom;
  private _blockHash: string | null = null;

  public constructor(private readonly _ws: WsProvider) {
    this._blockHashAtom = createAtom(
      'block.hash',
      () => this._incCallabcksCount(),
      () => this._descCallbacksCount()
    );
  }

  private _incCallabcksCount() {
    if (this._callabcksCount === 0) {
      this._unsub = subscribeStorage(this._ws, (err, result) => {
        if (err) {
          // ignore
        }
        if (result) {
          transaction(() => {
            this._blockHash = result.block;
            this._handleUpdate(result.changes);
            this._blockHashAtom.reportChanged();
          });
        }
      });
    }
    this._callabcksCount++;
  }

  private _descCallbacksCount() {
    this._callabcksCount--;
    if (this._callabcksCount === 0) {
      this._unsub();
    }
  }

  private _handleUpdate(changeset: [string, string][]) {
    for (const [key, value] of changeset) {
      const callbacks = this._trackKeys[key];
      if (callbacks) {
        for (const callback of callbacks) {
          callback(key, value);
        }
      }
      // TODO: improve this to make it better than O(mn)
      for (const [prefix, prefixCallbacks] of Object.entries(this._trackPrefixes)) {
        if (key.startsWith(prefix)) {
          for (const callback of prefixCallbacks) {
            callback(key, value);
          }
        }
      }
    }
  }

  public trackKey(key: string, callback: Callback): () => void {
    let callbacks = this._trackKeys[key];
    if (callbacks == null) {
      callbacks = [];
      this._trackKeys[key] = callbacks;
    }
    callbacks.push(callback);
    this._incCallabcksCount();
    return () => {
      const idx = callbacks.indexOf(callback);
      if (idx !== -1) {
        callbacks.splice(idx, 1);
        this._descCallbacksCount();
      }
    };
  }

  public trackPrefix(prefix: string, callback: Callback): () => void {
    let callbacks = this._trackPrefixes[prefix];
    if (callbacks == null) {
      callbacks = [];
      this._trackPrefixes[prefix] = callbacks;
    }
    callbacks.push(callback);
    this._incCallabcksCount();
    return () => {
      const idx = callbacks.indexOf(callback);
      if (idx !== -1) {
        callbacks.splice(idx, 1);
        this._descCallbacksCount();
      }
    };
  }

  public get blockHash() {
    this._blockHashAtom.reportObserved();
    return this._blockHash;
  }
}
