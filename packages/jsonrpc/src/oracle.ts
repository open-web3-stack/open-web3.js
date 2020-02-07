import { RpcMethodOpt } from '@polkadot/jsonrpc/types';
import createMethod from '@polkadot/jsonrpc/create/method';
import createParam from '@polkadot/jsonrpc/create/param';

const section = 'oracle';

const getValue: RpcMethodOpt = {
  description: 'Retrieves the oracle value for a given key.',
  params: [
    createParam('key', 'OracleKey')
  ],
  type: 'Option<TimestampedValue>'
};

/**
 * @summary Calls to retrieve oracle data.
 */
export default {
  isDeprecated: false,
  isHidden: false,
  description: 'Retrieves oracle data.',
  section,
  methods: {
    getValue: { ...createMethod(section, 'getValue', getValue), name: 'getValue' }
  }
};
