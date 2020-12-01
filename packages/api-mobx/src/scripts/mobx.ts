// Copyright 2017-2020 @polkadot/typegen authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Handlebars from 'handlebars';

import { StorageEntryMetadataLatest } from '@polkadot/types/interfaces/metadata';
import { Registry, RegisteredTypes, TypeDef } from '@polkadot/types/types';

import { Metadata } from '@polkadot/metadata/Metadata';
import * as defaultDefs from '@polkadot/types/interfaces/definitions';
import { unwrapStorageType } from '@polkadot/types/primitive/StorageKey';
import { TypeRegistry } from '@polkadot/types/create';
import { stringCamelCase } from '@polkadot/util';

import {
  TypeImports,
  createImports,
  compareName,
  formatType,
  readTemplate,
  registerDefinitions,
  getSimilarTypes,
  setImports,
  writeFile
} from './util';
import { ModuleTypes } from './util/imports';

Handlebars.registerHelper('inc', function (value) {
  return parseInt(value) + 1;
});

// From a storage entry metadata, we return [args, returnType]
/** @internal */
function entrySignature(
  allDefs: Record<string, ModuleTypes>,
  registry: Registry,
  storageEntry: StorageEntryMetadataLatest,
  imports: TypeImports
): [string[], string] {
  const format = (type: string | TypeDef) => formatType(allDefs, type, imports);

  const outputType = unwrapStorageType(storageEntry.type, storageEntry.modifier.isOptional);

  if (storageEntry.type.isPlain) {
    setImports(allDefs, imports, [storageEntry.type.asPlain.toString()]);

    return [[], formatType(allDefs, outputType, imports)];
  } else if (storageEntry.type.isMap) {
    // Find similar types of the `key` type
    const key = getSimilarTypes(allDefs, registry, storageEntry.type.asMap.key.toString(), imports);
    const value = storageEntry.type.asMap.value.toString();

    setImports(allDefs, imports, [...key, value]);

    return [[key.map(format).join(' | ')], formatType(allDefs, outputType, imports)];
  } else if (storageEntry.type.isDoubleMap) {
    // Find similar types of `key1` and `key2` types
    const key1 = getSimilarTypes(allDefs, registry, storageEntry.type.asDoubleMap.key1.toString(), imports);
    const key2 = getSimilarTypes(allDefs, registry, storageEntry.type.asDoubleMap.key2.toString(), imports);
    const value = storageEntry.type.asDoubleMap.value.toString();

    setImports(allDefs, imports, [...key1, ...key2, value]);

    return [[key1.map(format).join(' | '), key2.map(format).join(' | ')], formatType(allDefs, outputType, imports)];
  }

  throw new Error(`entryArgs: Cannot parse args of entry ${storageEntry.name.toString()}`);
}

const template = readTemplate('mobx');
const generateForMetaTemplate = Handlebars.compile(template);

/** @internal */
function generateForMeta(
  registry: Registry,
  meta: Metadata,
  dest: string,
  extraTypes: Record<string, Record<string, { types: Record<string, any> }>>
): void {
  writeFile(dest, (): string => {
    const allTypes: Record<string, Record<string, { types: Record<string, any> }>> = {
      '@polkadot/types/interfaces': defaultDefs,
      ...extraTypes
    };
    const imports = createImports(allTypes);
    const allDefs = Object.entries(allTypes).reduce((defs, [path, obj]) => {
      return Object.entries(obj).reduce((defs, [key, value]) => ({ ...defs, [`${path}/${key}`]: value }), defs);
    }, {});

    const modules = meta.asLatest.modules
      .sort(compareName)
      .filter((mod) => !mod.storage.isNone)
      .map(({ name, storage }) => {
        const items = storage
          .unwrap()
          .items.sort(compareName)
          .map((storageEntry) => {
            const [args, returnType] = entrySignature(allDefs, registry, storageEntry, imports);
            let entryType = `${returnType} | null`;

            if (storageEntry.type.isMap) {
              entryType = `StorageMap<${args.join(', ')}, ${returnType}>`;
            }

            if (storageEntry.type.isDoubleMap) {
              entryType = `StorageDoubleMap<${args.join(', ')}, ${returnType}>`;
            }

            return {
              args,
              docs: storageEntry.documentation,
              entryType,
              name: stringCamelCase(storageEntry.name.toString()),
              returnType
            };
          });

        return {
          items,
          name: stringCamelCase(name.toString())
        };
      });

    const types = [
      ...Object.keys(imports.localTypes)
        .sort()
        .map((packagePath): { file: string; types: string[] } => ({
          file: packagePath,
          types: Object.keys(imports.localTypes[packagePath])
        })),
      {
        file: '@open-web3/api-mobx',
        types: ['StorageMap', 'StorageDoubleMap', 'BaseStorageType']
      }
    ];

    return generateForMetaTemplate({
      headerType: 'chain',
      imports,
      modules,
      types
    });
  });
}

/**
 * Generate StorageType for api-mobx
 *
 * @param {string} dest
 * @param {string} metadataHex
 * @param {Record<string, Record<string, { types: Record<string, any> }>>} [definations={}]
 * @param {RegisteredTypes} [knownTypes={}]
 * @returns {void}
 */
export default function gerateMobx(
  dest: string,
  metadataHex: string,
  definations: Record<string, Record<string, { types: Record<string, any> }>> = {},
  knownTypes: RegisteredTypes = {}
): void {
  const registry = new TypeRegistry();

  registry.setKnownTypes(knownTypes);

  registerDefinitions(registry, definations);

  return generateForMeta(registry, new Metadata(registry, metadataHex), dest, definations);
}
