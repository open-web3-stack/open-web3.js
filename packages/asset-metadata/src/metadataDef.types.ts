// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import { Option, Struct, Vec } from '@polkadot/types/codec';
import { Text, u8 } from '@polkadot/types/primitive';

/** @name AssetArgDef */
export interface AssetArgDef extends Struct {
  readonly name: Text;
  readonly type: Text;
  readonly default: Option<Text>;
}

/** @name AssetMetadataCall */
export interface AssetMetadataCall extends Struct {
  readonly args: Vec<AssetArgDef>;
  readonly argSequence: Vec<u8>;
  readonly section: Text;
  readonly method: Text;
}

/** @name AssetMetadataCalls */
export interface AssetMetadataCalls extends Struct {
  readonly transfer: AssetMetadataCall;
}

/** @name AssetMetadataDef */
export interface AssetMetadataDef extends Struct {
  readonly currencyId: Text;
  readonly url: Option<Text>;
  readonly description: AssetMetadataDescription;
  readonly operations: AssetMetadataOperationDescription;
}

/** @name AssetMetadataDescription */
export interface AssetMetadataDescription extends Struct {
  readonly currencyId: Text;
  readonly name: Text;
  readonly symbol: Text;
  readonly decimals: u8;
  readonly description: Text;
  readonly uri: Option<Text>;
  readonly icon: Option<Text>;
}

/** @name AssetMetadataOperationDescription */
export interface AssetMetadataOperationDescription extends Struct {
  readonly currencyId: Text;
  readonly storage: AssetMetadataStorage;
  readonly calls: AssetMetadataCalls;
}

/** @name AssetMetadataPath */
export interface AssetMetadataPath extends Vec<Text> {}

/** @name AssetMetadataQuery */
export interface AssetMetadataQuery extends Struct {
  readonly args: Vec<AssetArgDef>;
  readonly argSequence: Vec<u8>;
  readonly section: Text;
  readonly method: Text;
  readonly path: AssetMetadataPath;
}

/** @name AssetMetadataStorage */
export interface AssetMetadataStorage extends Struct {
  readonly freeBalance: AssetMetadataQuery;
}
