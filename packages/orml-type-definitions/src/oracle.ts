export default {
  rpc: {
    getValue: {
      description: 'Retrieves the oracle value for a given key.',
      params: [
        {
          name: 'DataProviderId',
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
          name: 'DataProviderId',
          type: 'DataProviderId'
        }
      ],
      type: 'Vec<(OracleKey, Option<TimestampedValue>)>'
    }
  },
  types: {
    DataProviderId: 'u8',
    TimestampedValue: {
      value: 'OracleValue',
      timestamp: 'Moment'
    },
    TimestampedValueOf: 'TimestampedValue',
    OrderedSet: 'Vec<AccountId>'
  }
};
