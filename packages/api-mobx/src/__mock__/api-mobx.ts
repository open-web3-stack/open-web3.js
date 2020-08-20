// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

import { AnyNumber, ITuple } from '@polkadot/types/types';
import { Option, Vec } from '@polkadot/types/codec';
import { Bytes, bool, u32, u64 } from '@polkadot/types/primitive';
import {
  AccountId,
  Balance,
  BalanceOf,
  BlockNumber,
  ExtrinsicsWeight,
  Hash,
  KeyTypeId,
  Releases,
  ValidatorId
} from '@polkadot/types/interfaces/runtime';
import {
  BabeAuthorityWeight,
  MaybeRandomness,
  NextConfigDescriptor,
  Randomness
} from '@polkadot/types/interfaces/babe';
import { AccountData, BalanceLock } from '@polkadot/types/interfaces/balances';
import { ProposalIndex } from '@polkadot/types/interfaces/collective';
import { AuthorityId } from '@polkadot/types/interfaces/consensus';
import { Proposal } from '@polkadot/types/interfaces/democracy';
import { SetId, StoredPendingChange, StoredState } from '@polkadot/types/interfaces/grandpa';
import { Keys, SessionIndex } from '@polkadot/types/interfaces/session';
import {
  ActiveEraInfo,
  ElectionResult,
  ElectionScore,
  ElectionStatus,
  EraIndex,
  EraRewardPoints,
  Exposure,
  Forcing,
  Nominations,
  RewardDestination,
  SlashingSpans,
  SpanIndex,
  SpanRecord,
  StakingLedger,
  UnappliedSlash,
  ValidatorPrefs
} from '@polkadot/types/interfaces/staking';
import {
  AccountInfo,
  DigestOf,
  EventIndex,
  EventRecord,
  LastRuntimeUpgradeInfo,
  Phase
} from '@polkadot/types/interfaces/system';
import { OpenTip } from '@polkadot/types/interfaces/treasury';
import { StorageDoubleMap, StorageMap, BaseStorageType } from '@open-web3/api-mobx/src';

export interface StorageType extends BaseStorageType {
  staking: {
    /**
     * Exposure of validator at era.
     *
     * This is keyed first by the era index to allow bulk deletion and then the stash account.
     *
     * Is it removed after `HISTORY_DEPTH` eras.
     * If stakers hasn't been set or has been removed then empty exposure is returned.
     **/
    erasStakers: StorageDoubleMap<EraIndex | AnyNumber | Uint8Array, AccountId | string | Uint8Array, Exposure>;
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
