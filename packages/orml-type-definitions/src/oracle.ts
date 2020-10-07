export default {
  rpc: {
    getValue: {
      description: 'Retrieves the oracle value for a given key.',
      params: [
        {
          name: 'providerId',
          type: 'DataProviderId'
        },
        {
          name: 'key',
          type: 'OracleKey' as 'u8'
        }
      ],
      type: 'Option<TimestampedValue>'
    },
    getAllValues: {
      description: 'Retrieves all oracle values.',
      params: [
        {
          name: 'providerId',
          type: 'DataProviderId'
        }
      ],
      type: 'Vec<(OracleKey, Option<TimestampedValue>)>'
    }
  },
  types: {
    DataProviderId: {
      _enum: ['Aggregated', 'Laminar', 'Band']
    },
    TimestampedValue: {
      value: 'OracleValue',
      timestamp: 'Moment'
    },
    TimestampedValueOf: 'TimestampedValue',
    OrderedSet: 'Vec<AccountId>'
  }
};
