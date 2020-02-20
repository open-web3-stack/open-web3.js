/* eslint-disable */

import {
  AccountId,
  AccountIndex,
  Balance,
  BlockNumber,
  CurrencyId,
  Hash,
  Index,
  LiquidityPoolId,
  LiquidityPoolOption,
  Moment,
  OracleKey,
  Permill,
  Position,
  Weight
} from '@laminar/types/interfaces/runtime';
import { Option, Vec } from '@polkadot/types/codec';
import { Bytes, bool, u32 } from '@polkadot/types/primitive';
import { AnyNumber, ITuple } from '@polkadot/types/types';
import { Observable } from 'rxjs';

declare module '@polkadot/api/types/storage' {
  export interface AugmentedQueries<ApiType> {
    tokens: {
      [index: string]: QueryableStorageEntry<ApiType>;
      /**
       * The total issuance of a token type.
       **/
      totalIssuance: AugmentedQuery<
        ApiType,
        (arg: CurrencyId | 'LAMI' | 'AUSD' | 'FEUR' | 'FJPY' | number | Uint8Array) => Observable<Balance>
      > &
        QueryableStorageEntry<ApiType>;
      /**
       * The balance of a token type under an account.
       **/
      balance: AugmentedQuery<
        ApiType,
        (
          key1: CurrencyId | 'LAMI' | 'AUSD' | 'FEUR' | 'FJPY' | number | Uint8Array,
          key2: AccountId | string | Uint8Array
        ) => Observable<Balance>
      > &
        QueryableStorageEntry<ApiType>;
    };
  }
}
