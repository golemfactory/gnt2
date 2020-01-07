import {formatValue} from '../src/utils/formatter';
import {expect} from 'chai';

describe('formatEther', () => {
  [
    ['1000000000000000000', 4, '1.0000'],
    ['1234500000000000000', 4, '1.2345'],
    ['1', 18, '0.000000000000000001'],
    ['1', 4, '0.0000'],
    ['900000000000000', 3, '0.001'],
    ['900000000000000', 4, '0.0009'],
    ['90', 4, '0.0000']
  ].forEach(([value, digits, expected]) => {
    it(`formats ${value} number to ${expected}`, () => {
      expect(formatValue(value, +digits)).to.eq(expected);
    });
  });

});
