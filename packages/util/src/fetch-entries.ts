import { Codec } from '@polkadot/types/types';
import { StorageKey } from '@polkadot/types';

export type GetEntries<Entry, Key1 extends Codec = any, Key2 extends Codec = any> = (
  startKey?: string
) => Promise<[StorageKey<[Key1, Key2]>, Entry][]>;

export type ProcessEntry<Entry, Key1 extends Codec = any, Key2 extends Codec = any> = (
  key: StorageKey<[Key1, Key2]>,
  entry: Entry
) => any;

export async function fetchEntries<Entry, Key1 extends Codec = any, Key2 extends Codec = any>(
  getEntries: GetEntries<Entry, Key1, Key2>,
  processEntry: ProcessEntry<Entry, Key1, Key2>
) {
  const processEntries = async (entries: [StorageKey<[Key1, Key2]>, Entry][]) => {
    for (const entry of entries) {
      await processEntry(entry[0], entry[1]);
    }

    if (entries.length > 0) {
      return entries[entries.length - 1][0];
    }

    return undefined;
  };

  const entries = await getEntries();
  let nextKey = await processEntries(entries);
  while (nextKey) {
    const entries = await getEntries(nextKey.toHex());
    nextKey = await processEntries(entries);
  }
}

export async function fetchEntriesToArray<Entry, Key1 extends Codec = any, Key2 extends Codec = any>(
  getEntries: GetEntries<Entry, Key1, Key2>
) {
  const res = [] as [StorageKey<[Key1, Key2]>, Entry][];
  await fetchEntries(getEntries, (key, value) => res.push([key, value]));
  return res;
}
