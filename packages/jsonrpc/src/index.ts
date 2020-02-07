import { RpcSection } from '@polkadot/jsonrpc/types';

import oracle from './oracle';

const interfaces: Record<string, RpcSection> = {
  oracle
};

export default interfaces;
