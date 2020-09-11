import { Definitions } from '@polkadot/types/types';
import definitions from '@open-web3/orml-type-definitions/rewards';

export default {
  rpc: {
    ...definitions.rpc
  },
  types: {
    ...definitions.types
  }
} as Definitions;
