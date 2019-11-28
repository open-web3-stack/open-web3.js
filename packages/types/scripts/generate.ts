import { generateInterfaceRegistry } from '@polkadot/types/scripts/generateTypes/interfaceRegistry';
import { generateTsDef } from '@polkadot/types/scripts/generateTypes/tsDef';

import * as definations from '../src/interfaces/definitions';

generateTsDef(definations, 'packages/types/src/interfaces');
generateInterfaceRegistry(definations, 'packages/types/src/interfaceRegistry.ts');
