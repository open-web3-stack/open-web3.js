import { withAccuracy } from '..';

describe('withAccuracy', () => {
  it('works', () => {
    const data = [
      ['0.000000000000000001', '1'],
      ['1', '1000000000000000000'],
      [42, '42000000000000000000'],
      [0.001234, '1234000000000000']
    ];
    for (const [input, expected] of data) {
      expect(withAccuracy(input)).toEqual(expected);
    }
  });
});
