// Copyright 2017-2021 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StorageEntryTypeLatest } from '@polkadot/types/interfaces/metadata';
import { StorageKey } from '@polkadot/types/primitive/StorageKey';
import type { StorageEntry } from '@polkadot/types/primitive/types';
import type { InterfaceTypes } from '@polkadot/types/types';
import { isFunction } from '@polkadot/util';

function getStorageType(type: StorageEntryTypeLatest): keyof InterfaceTypes {
  if (type.isPlain) {
    return type.asPlain.toString() as keyof InterfaceTypes;
  } else if (type.isMap) {
    return type.asMap.value.toString() as keyof InterfaceTypes;
  } else if (type.isDoubleMap) {
    return type.asDoubleMap.value.toString() as keyof InterfaceTypes;
  } else if (type.isNMap) {
    return type.asNMap.value.toString() as keyof InterfaceTypes;
  }
  return 'Raw';
}

/** @internal */
export function getType(value: StorageKey | StorageEntry | [StorageEntry, any]): keyof InterfaceTypes {
  if (value instanceof StorageKey) {
    return value.outputType as keyof InterfaceTypes;
  } else if (isFunction(value)) {
    return getStorageType(value.meta.type);
  } else if (Array.isArray(value)) {
    const [fn] = value;

    if (fn.meta) {
      return getStorageType(fn.meta.type);
    }
  }

  // If we have no type set, default to Raw
  return 'Raw';
}
