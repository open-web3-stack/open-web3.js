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
    getValues: {
      description: 'Retrieves all oracle values.',
      params: [],
      type: 'Option<Vec<TimestampedValue>>'
    }
  },
  types: {
    TimestampedValue: {
      value: 'OracleValue',
      timestamp: 'Moment'
    },
    TimestampedValueOf: 'TimestampedValue'
  }
};
