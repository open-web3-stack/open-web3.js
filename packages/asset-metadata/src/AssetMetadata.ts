import { ApiRx } from '@polkadot/api';
import { Balance } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { map } from 'rxjs/operators';
import metadataDef from './metadataDef';
import { AssetMetadataCall, AssetMetadataDef, AssetMetadataPath, AssetMetadataQuery } from './metadataDef.types';

class AssetMetadata {
  public readonly api: ApiRx;
  public readonly metadata: AssetMetadataDef;

  constructor(api: ApiRx, assetMetadata: any) {
    this.api = api;

    this.api.registerTypes(assetMetadata.types);
    this.api.registerTypes(metadataDef);
    this.metadata = this.api.createType('AssetMetadataDef' as any, assetMetadata);
  }

  handleArgs(def: AssetMetadataQuery | AssetMetadataCall, args: any[]) {
    if (args.length !== def.argSequence.length) {
      throw new Error('args must have the same length as argSequence');
    }
    return def.args.map((argDef, index) => {
      if (!argDef.default.isNone) return argDef.default.unwrap().toString();
      const argIndex = def.argSequence.toU8a().indexOf(index);
      if (argIndex < 0) {
        throw new Error('args must have the same length as argSequence');
      }
      return args[argIndex];
    });
  }

  handlePath<T>(path: AssetMetadataPath, data: any) {
    let result: T | undefined;
    let current: AssetMetadataPath[number] | undefined;

    while ((current = path.shift())) {
      result = data && data[current.toString()];
    }

    if (!result) {
      throw new Error('Cannot get the result from the path');
    }

    return result;
  }

  createQuery<T>(def: AssetMetadataQuery, ...args: any) {
    return this.api.query[def.section.toString()][def.method.toString()](this.handleArgs(def, [args])).pipe(
      map((result) => {
        return this.handlePath<T>(def.path, result);
      })
    );
  }

  createTx(def: AssetMetadataCall, ...args: any) {
    return this.api.tx[def.section.toString()][def.method.toString()](this.handleArgs(def, [args]));
  }

  freeBalance<T = Balance>(accountId: string) {
    return this.createQuery<T>(this.metadata.operations.storage.freeBalance, accountId);
  }

  transfer(dest: string, amount: BN) {
    return this.createTx(this.metadata.operations.calls.transfer, dest, amount);
  }
}

export default AssetMetadata;
