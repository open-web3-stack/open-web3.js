import authority from './authority';
import graduallyUpdates from './graduallyUpdates';
import oracle from './oracle';
import tokens from './tokens';
import traits from './traits';
import vesting from './vesting';
import rewards from './rewards';
import typesFromDefs from './utils/typesFromDefs';
import jsonrpcFromDefs from './utils/jsonrpcFromDefs';

const defs = {
  authority,
  graduallyUpdates,
  oracle,
  tokens,
  traits,
  vesting,
  rewards
};

const types = typesFromDefs(defs);
const rpc = jsonrpcFromDefs(defs);

export default {
  types,
  rpc
};
