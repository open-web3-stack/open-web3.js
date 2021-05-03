export default {
  rpc: {
    getValue: {
      description: 'Retrieves the oracle value for a given key.',
      params: [
        {
          name: 'providerId',
          type: 'RpcDataProviderId'
        },
        {
          name: 'key',
          type: 'OracleKey' as 'u8'
        },
        {
          name: 'at',
          type: 'BlockHash',
          isHistoric: true,
          isOptional: true
        }
      ],
      type: 'Option<TimestampedValue>'
    },
    getAllValues: {
      description: 'Retrieves all oracle values.',
      params: [
        {
          name: 'providerId',
          type: 'RpcDataProviderId'
        },
        {
          name: 'at',
          type: 'BlockHash',
          isHistoric: true,
          isOptional: true
        }
      ],
      type: 'Vec<(OracleKey, Option<TimestampedValue>)>'
    }
  },
  types: {
    RpcDataProviderId: 'Text',
    DataProviderId: 'u8',
    TimestampedValue: {
      value: 'OracleValue',
      timestamp: 'Moment'
    },
    TimestampedValueOf: 'TimestampedValue',
    OrderedSet: 'Vec<AccountId>'
  }
};
