// Copyright 2017-2021 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StorageEntryTypeLatest } from '@polkadot/types/interfaces/metadata';
import { StorageKey } from '@polkadot/types/primitive/StorageKey';
import type { StorageEntry } from '@polkadot/types/primitive/types';
import type { InterfaceTypes } from '@polkadot/types/types';
import { isFunction } from '@polkadot/util';

function getStorageType(type: StorageEntryTypeLatest): [boolean, string] {
  if (type.isPlain) {
    return [false, type.asPlain.toString()];
  } else if (type.isDoubleMap) {
    return [false, type.asDoubleMap.value.toString()];
  }

  return [false, type.asMap.value.toString()];
}

// we unwrap the type here, turning into an output usable for createType
/** @internal */
export function unwrapStorageType(type: StorageEntryTypeLatest, isOptional?: boolean): keyof InterfaceTypes {
  const [hasWrapper, outputType] = getStorageType(type);

  return isOptional && !hasWrapper
    ? (`Option<${outputType}>` as keyof InterfaceTypes)
    : (outputType as keyof InterfaceTypes);
}

/** @internal */
export function getType(value: StorageKey | StorageEntry | [StorageEntry, any]): keyof InterfaceTypes {
  if (value instanceof StorageKey) {
    let type = value.outputType;
    if (value.meta?.modifier.isOptional) {
      type = `Option<${type}>`;
    }
    return type as keyof InterfaceTypes;
  } else if (isFunction(value)) {
    return unwrapStorageType(value.meta.type, value.meta.modifier.isOptional);
  } else if (Array.isArray(value)) {
    const [fn] = value;

    if (fn.meta) {
      return unwrapStorageType(fn.meta.type, fn.meta.modifier.isOptional);
    }
  }

  // If we have no type set, default to Raw
  return 'Raw';
}
