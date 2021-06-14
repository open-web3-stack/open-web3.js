import authority from './authority';
import graduallyUpdates from './graduallyUpdates';
import oracle from './oracle';
import rewards from './rewards';
import runtime from './runtime';
import tokens from './tokens';
import traits from './traits';
import { jsonrpcFromDefs, typesAliasFromDefs, typesFromDefs } from './utils';
import vesting from './vesting';

const defs = {
  authority,
  graduallyUpdates,
  oracle,
  tokens,
  traits,
  vesting,
  rewards,
  runtime
};

export const types = typesFromDefs(defs);
export const rpc = jsonrpcFromDefs(defs);
export const typesAlias = typesAliasFromDefs(defs);
