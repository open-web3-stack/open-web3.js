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
