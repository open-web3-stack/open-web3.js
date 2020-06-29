export default {
  rpc: {
    getValue: {
      description: 'Retrieves the oracle value for a given key.',
      params: [
        {
          name: 'key',
          type: 'OracleKey' as 'u8'
        }
      ],
      type: 'Option<TimestampedValue>'
    },
    getAllValues: {
      description: 'Retrieves all oracle values.',
      params: [],
      type: 'Vec<(OracleKey, Option<TimestampedValue>)>'
    }
  },
  types: {
    TimestampedValue: {
      value: 'OracleValue',
      timestamp: 'Moment'
    },
    TimestampedValueOf: 'TimestampedValue',
    OrderedSet: 'Vec<AccountId>'
  }
};
