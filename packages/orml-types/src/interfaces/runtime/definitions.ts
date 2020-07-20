import { Definitions } from '@polkadot/types/types';
import definitions from '@polkadot/types/interfaces/runtime/definitions';

export default {
  rpc: {
    ...definitions.rpc
  },
  types: {
    ...definitions.types,
    OracleValue: 'FixedU128',
    FixedU128: 'u128'
  }
} as Definitions;
