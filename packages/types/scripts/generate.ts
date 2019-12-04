import { generateInterfaceRegistry } from '@polkadot/types/scripts/generateTypes/interfaceRegistry';
import { generateTsDef } from '@polkadot/types/scripts/generateTypes/tsDef';
import * as defaultDefinations from '@polkadot/types/interfaces/definitions';

import * as ormlDefinations from '../src/interfaces/definitions';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { runtime, ...substrateDefinations } = defaultDefinations;

const definations = {
  '@polkadot/types/interfaces': substrateDefinations,
  '@orml/types/interfaces': ormlDefinations
};

generateTsDef(definations, 'packages/types/src/interfaces', '@orml/types/interfaces');
generateInterfaceRegistry(definations, 'packages/types/src/interfaceRegistry.ts');
