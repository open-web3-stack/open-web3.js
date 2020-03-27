import { fromBaseUnit, toBaseUnit } from '..';

describe('toBaseUnit', () => {
  it('works', () => {
    const data = [
      ['0.000000000000000001', '1'],
      ['1', '1000000000000000000'],
      [42, '42000000000000000000'],
      [0.001234, '1234000000000000']
    ];
    for (const [input, expected] of data) {
      expect(toBaseUnit(input).toFixed()).toEqual(expected);
    }
  });
});

describe('fromBaseUnit', () => {
  it('works', () => {
    const data = [
      ['1', '0.000000000000000001'],
      ['1000000000000000000', '1'],
      ['42000000000000000000', '42'],
      ['1234000000000000', '0.001234']
    ];
    for (const [input, expected] of data) {
      expect(fromBaseUnit(input).toFixed()).toEqual(expected);
    }
  });
});
