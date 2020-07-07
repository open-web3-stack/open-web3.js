// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

import { ITuple } from '@polkadot/types/types';
import { Option, Vec } from '@polkadot/types/codec';
import { Bytes, bool, u32, u64 } from '@polkadot/types/primitive';
import {
  AccountId,
  Balance,
  BalanceOf,
  BlockNumber,
  ExtrinsicsWeight,
  Hash,
  Perbill,
  Releases
} from '@open-web3/orml-types/interfaces/runtime';
import {
  BabeAuthorityWeight,
  MaybeRandomness,
  NextConfigDescriptor,
  Randomness
} from '@polkadot/types/interfaces/babe';
import { AccountData, BalanceLock } from '@polkadot/types/interfaces/balances';
import { AuthorityId } from '@polkadot/types/interfaces/consensus';
import { SessionIndex } from '@polkadot/types/interfaces/session';
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
import { StorageDoubleMap, StorageMap } from '@open-web3/api-mobx';

export interface StorageType {
  babe: {
    /**
     * Current epoch authorities.
     *
     **/
    authorities: Vec<ITuple<[AuthorityId, BabeAuthorityWeight]>>;
    /**
     * Current slot number.
     *
     **/
    currentSlot: u64;
    /**
     * Current epoch index.
     *
     **/
    epochIndex: u64;
    /**
     * The slot at which the first epoch actually started. This is 0
     * until the first block of the chain.
     *
     **/
    genesisSlot: u64;
    /**
     * Temporary value (cleared at block finalization) which is `Some`
     * if per-block initialization has already been called for current block.
     *
     **/
    initialized: Option<MaybeRandomness>;
    /**
     * How late the current block is compared to its parent.
     *
     * This entry is populated as part of block execution and is cleaned up
     * on block finalization. Querying this storage entry outside of block
     * execution context should always yield zero.
     *
     **/
    lateness: BlockNumber;
    /**
     * Next epoch configuration, if changed.
     *
     **/
    nextEpochConfig: Option<NextConfigDescriptor>;
    /**
     * Next epoch randomness.
     *
     **/
    nextRandomness: Randomness;
    /**
     * The epoch randomness for the *current* epoch.
     *
     * # Security
     *
     * This MUST NOT be used for gambling, as it can be influenced by a
     * malicious validator in the short term. It MAY be used in many
     * cryptographic protocols, however, so long as one remembers that this
     * (like everything else on-chain) it is public. For example, it can be
     * used where a number is needed that cannot have been chosen by an
     * adversary, for purposes such as public-coin zero-knowledge proofs.
     *
     **/
    randomness: Randomness;
    /**
     * Randomness under construction.
     *
     * We make a tradeoff between storage accesses and list length.
     * We store the under-construction randomness in segments of up to
     * `UNDER_CONSTRUCTION_SEGMENT_LENGTH`.
     *
     * Once a segment reaches this length, we begin the next one.
     * We reset all segments and return to `0` at the beginning of every
     * epoch.
     *
     **/
    segmentIndex: u32;
    /**
     * TWOX-NOTE: `SegmentIndex` is an increasing integer, so this is okay.
     *
     *
     * @key1 u32
     **/
    underConstruction: StorageMap<string, Vec<Randomness>>;
  };
  balances: {
    /**
     * The balance of an account.
     *
     * NOTE: This is only used in the case that this module is used to store balances.
     *
     *
     * @key1 AccountId
     **/
    account: StorageMap<string, AccountData>;
    /**
     * Any liquidity locks on some account balances.
     * NOTE: Should only be accessed when setting, changing and freeing a lock.
     *
     *
     * @key1 AccountId
     **/
    locks: StorageMap<string, Vec<BalanceLock>>;
    /**
     * Storage version of the pallet.
     *
     * This is set to v2.0.0 for new networks.
     *
     **/
    storageVersion: Releases;
    /**
     * The total units issued in the system.
     *
     **/
    totalIssuance: Balance;
  };
  staking: {
    /**
     * The active era information, it holds index and start.
     *
     * The active era is the era currently rewarded.
     * Validator set of this era must be equal to `SessionInterface::validators`.
     *
     **/
    activeEra: Option<ActiveEraInfo>;
    /**
     * Map from all locked "stash" accounts to the controller account.
     *
     *
     * @key1 AccountId
     **/
    bonded: StorageMap<string, Option<AccountId>>;
    /**
     * A mapping from still-bonded eras to the first session index of that era.
     *
     * Must contains information for eras for the range:
     * `[active_era - bounding_duration; active_era]`
     *
     **/
    bondedEras: Vec<ITuple<[EraIndex, SessionIndex]>>;
    /**
     * The amount of currency given to reporters of a slash event which was
     * canceled by extraordinary circumstances (e.g. governance).
     *
     **/
    canceledSlashPayout: BalanceOf;
    /**
     * The current era index.
     *
     * This is the latest planned era, depending on how the Session pallet queues the validator
     * set, it might be active or not.
     *
     **/
    currentEra: Option<EraIndex>;
    /**
     * The earliest era for which we have a pending, unapplied slash.
     *
     **/
    earliestUnappliedSlash: Option<EraIndex>;
    /**
     * Flag to control the execution of the offchain election. When `Open(_)`, we accept
     * solutions to be submitted.
     *
     **/
    eraElectionStatus: ElectionStatus;
    /**
     * Rewards for the last `HISTORY_DEPTH` eras.
     * If reward hasn't been set or has been removed then 0 reward is returned.
     *
     *
     * @key1 EraIndex
     **/
    erasRewardPoints: StorageMap<string, EraRewardPoints>;
    /**
     * Exposure of validator at era.
     *
     * This is keyed first by the era index to allow bulk deletion and then the stash account.
     *
     * Is it removed after `HISTORY_DEPTH` eras.
     * If stakers hasn't been set or has been removed then empty exposure is returned.
     *
     *
     * @key1 EraIndex
     *
     * @key2 AnyNumber
     **/
    erasStakers: StorageDoubleMap<string, string, Exposure>;
    /**
     * Clipped Exposure of validator at era.
     *
     * This is similar to [`ErasStakers`] but number of nominators exposed is reduced to the
     * `T::MaxNominatorRewardedPerValidator` biggest stakers.
     * (Note: the field `total` and `own` of the exposure remains unchanged).
     * This is used to limit the i/o cost for the nominator payout.
     *
     * This is keyed fist by the era index to allow bulk deletion and then the stash account.
     *
     * Is it removed after `HISTORY_DEPTH` eras.
     * If stakers hasn't been set or has been removed then empty exposure is returned.
     *
     *
     * @key1 EraIndex
     *
     * @key2 AnyNumber
     **/
    erasStakersClipped: StorageDoubleMap<string, string, Exposure>;
    /**
     * The session index at which the era start for the last `HISTORY_DEPTH` eras.
     *
     *
     * @key1 EraIndex
     **/
    erasStartSessionIndex: StorageMap<string, Option<SessionIndex>>;
    /**
     * The total amount staked for the last `HISTORY_DEPTH` eras.
     * If total hasn't been set or has been removed then 0 stake is returned.
     *
     *
     * @key1 EraIndex
     **/
    erasTotalStake: StorageMap<string, BalanceOf>;
    /**
     * Similar to `ErasStakers`, this holds the preferences of validators.
     *
     * This is keyed first by the era index to allow bulk deletion and then the stash account.
     *
     * Is it removed after `HISTORY_DEPTH` eras.
     *
     *
     * @key1 EraIndex
     *
     * @key2 AnyNumber
     **/
    erasValidatorPrefs: StorageDoubleMap<string, string, ValidatorPrefs>;
    /**
     * The total validator era payout for the last `HISTORY_DEPTH` eras.
     *
     * Eras that haven't finished yet or has been removed doesn't have reward.
     *
     *
     * @key1 EraIndex
     **/
    erasValidatorReward: StorageMap<string, Option<BalanceOf>>;
    /**
     * Mode of era forcing.
     *
     **/
    forceEra: Forcing;
    /**
     * Number of eras to keep in history.
     *
     * Information is kept for eras in `[current_era - history_depth; current_era]`.
     *
     * Must be more than the number of eras delayed by session otherwise. I.e. active era must
     * always be in history. I.e. `active_era > current_era - history_depth` must be
     * guaranteed.
     *
     **/
    historyDepth: u32;
    /**
     * Any validators that may never be slashed or forcibly kicked. It's a Vec since they're
     * easy to initialize and the performance hit is minimal (we expect no more than four
     * invulnerables) and restricted to testnets.
     *
     **/
    invulnerables: Vec<AccountId>;
    /**
     * True if the current **planned** session is final. Note that this does not take era
     * forcing into account.
     *
     **/
    isCurrentSessionFinal: bool;
    /**
     * Map from all (unlocked) "controller" accounts to the info regarding the staking.
     *
     *
     * @key1 AccountId
     **/
    ledger: StorageMap<string, Option<StakingLedger>>;
    /**
     * Minimum number of staking participants before emergency conditions are imposed.
     *
     **/
    minimumValidatorCount: u32;
    /**
     * The map from nominator stash key to the set of stash keys of all validators to nominate.
     *
     *
     * @key1 AccountId
     **/
    nominators: StorageMap<string, Option<Nominations>>;
    /**
     * All slashing events on nominators, mapped by era to the highest slash value of the era.
     *
     *
     * @key1 EraIndex
     *
     * @key2 AnyNumber
     **/
    nominatorSlashInEra: StorageDoubleMap<string, string, Option<BalanceOf>>;
    /**
     * Where the reward payment should be made. Keyed by stash.
     *
     *
     * @key1 AccountId
     **/
    payee: StorageMap<string, RewardDestination>;
    /**
     * The next validator set. At the end of an era, if this is available (potentially from the
     * result of an offchain worker), it is immediately used. Otherwise, the on-chain election
     * is executed.
     *
     **/
    queuedElected: Option<ElectionResult>;
    /**
     * The score of the current [`QueuedElected`].
     *
     **/
    queuedScore: Option<ElectionScore>;
    /**
     * Slashing spans for stash accounts.
     *
     *
     * @key1 AccountId
     **/
    slashingSpans: StorageMap<string, Option<SlashingSpans>>;
    /**
     * The percentage of the slash that is distributed to reporters.
     *
     * The rest of the slashed value is handled by the `Slash`.
     *
     **/
    slashRewardFraction: Perbill;
    /**
     * Snapshot of nominators at the beginning of the current election window. This should only
     * have a value when [`EraElectionStatus`] == `ElectionStatus::Open(_)`.
     *
     **/
    snapshotNominators: Option<Vec<AccountId>>;
    /**
     * Snapshot of validators at the beginning of the current election window. This should only
     * have a value when [`EraElectionStatus`] == `ElectionStatus::Open(_)`.
     *
     **/
    snapshotValidators: Option<Vec<AccountId>>;
    /**
     * Records information about the maximum slash of a stash within a slashing span,
     * as well as how much reward has been paid out.
     *
     *
     * @key1 (AccountId,SpanIndex)
     **/
    spanSlash: StorageMap<string, SpanRecord>;
    /**
     * True if network has been upgraded to this version.
     * Storage version of the pallet.
     *
     * This is set to v3.0.0 for new networks.
     *
     **/
    storageVersion: Releases;
    /**
     * All unapplied slashes that are queued for later.
     *
     *
     * @key1 EraIndex
     **/
    unappliedSlashes: StorageMap<string, Vec<UnappliedSlash>>;
    /**
     * The ideal number of staking participants.
     *
     **/
    validatorCount: u32;
    /**
     * The map from (wannabe) validator stash key to the preferences of that validator.
     *
     *
     * @key1 AccountId
     **/
    validators: StorageMap<string, ValidatorPrefs>;
    /**
     * All slashing events on validators, mapped by era to the highest slash proportion
     * and slash value of the era.
     *
     *
     * @key1 EraIndex
     *
     * @key2 AnyNumber
     **/
    validatorSlashInEra: StorageDoubleMap<string, string, Option<ITuple<[Perbill, BalanceOf]>>>;
  };
  system: {
    /**
     * The full account information for a particular account ID.
     *
     *
     * @key1 AccountId
     **/
    account: StorageMap<string, AccountInfo>;
    /**
     * Total length (in bytes) for all extrinsics put together, for the current block.
     *
     **/
    allExtrinsicsLen: Option<u32>;
    /**
     * Map of block numbers to block hashes.
     *
     *
     * @key1 BlockNumber
     **/
    blockHash: StorageMap<string, Hash>;
    /**
     * The current weight for the block.
     *
     **/
    blockWeight: ExtrinsicsWeight;
    /**
     * Digest of the current block, also part of the block header.
     *
     **/
    digest: DigestOf;
    /**
     * The number of events in the `Events<T>` list.
     *
     **/
    eventCount: EventIndex;
    /**
     * Events deposited for the current block.
     *
     **/
    events: Vec<EventRecord>;
    /**
     * Mapping between a topic (represented by T::Hash) and a vector of indexes
     * of events in the `<Events<T>>` list.
     *
     * All topic vectors have deterministic storage locations depending on the topic. This
     * allows light-clients to leverage the changes trie storage tracking mechanism and
     * in case of changes fetch the list of events of interest.
     *
     * The value has the type `(T::BlockNumber, EventIndex)` because if we used only just
     * the `EventIndex` then in case if the topic has the same contents on the next block
     * no notification will be triggered thus the event might be lost.
     *
     *
     * @key1 Hash
     **/
    eventTopics: StorageMap<string, Vec<ITuple<[BlockNumber, EventIndex]>>>;
    /**
     * The execution phase of the block.
     *
     **/
    executionPhase: Option<Phase>;
    /**
     * Total extrinsics count for the current block.
     *
     **/
    extrinsicCount: Option<u32>;
    /**
     * Extrinsics data for the current block (maps an extrinsic's index to its data).
     *
     *
     * @key1 u32
     **/
    extrinsicData: StorageMap<string, Bytes>;
    /**
     * Extrinsics root of the current block, also part of the block header.
     *
     **/
    extrinsicsRoot: Hash;
    /**
     * Stores the `spec_version` and `spec_name` of when the last runtime upgrade happened.
     *
     **/
    lastRuntimeUpgrade: Option<LastRuntimeUpgradeInfo>;
    /**
     * The current block number being processed. Set by `execute_block`.
     *
     **/
    number: BlockNumber;
    /**
     * Hash of the previous block.
     *
     **/
    parentHash: Hash;
  };
}
