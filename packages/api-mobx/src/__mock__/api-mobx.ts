import { AnyNumber } from '@polkadot/types/types';
import { AccountId, Hash } from '@polkadot/types/interfaces/runtime';
import { EraIndex, ValidatorPrefs } from '@polkadot/types/interfaces/staking';
import { AccountInfo } from '@polkadot/types/interfaces/system';
import { StorageDoubleMap, StorageMap, BaseStorageType } from '@open-web3/api-mobx/src';

export interface StorageType extends BaseStorageType {
  staking: {
    /**
     * Similar to `ErasStakers`, this holds the preferences of validators.
     *
     * This is keyed first by the era index to allow bulk deletion and then the stash account.
     *
     * Is it removed after `HISTORY_DEPTH` eras.
     **/
    erasValidatorPrefs: StorageDoubleMap<EraIndex | AnyNumber, AccountId | string, ValidatorPrefs>;
    /**
     * The map from (wannabe) validator stash key to the preferences of that validator.
     **/
    validators: StorageMap<AccountId | string | Uint8Array, ValidatorPrefs>;
  };
  system: {
    /**
     * The full account information for a particular account ID.
     **/
    account: StorageMap<AccountId | string | Uint8Array, AccountInfo>;
    /**
     * Hash of the previous block.
     **/
    parentHash: Hash | null;
  };
}
