import {convertBalanceToBigJs, isEmpty} from '../../src/utils/bigNumberUtils';
import {BigNumber} from 'ethers/utils';
import {expect} from 'chai';

describe('big number utils', () => {

  describe('isEmpty', () => {
    it('is false for non-zero number', () => {
      expect(isEmpty(new BigNumber('4'))).to.be.false;
    });

    it('is true for zero', () => {
      expect(isEmpty(new BigNumber('0'))).to.be.true;
    });

    it('is true for undefined', () => {
      expect(isEmpty(undefined)).to.be.true;
    });
  });

  describe('toBig', () => {
    it('converts number to Big.js', () => {
      expect(convertBalanceToBigJs(new BigNumber('1000000000000000000')).toString()).to.eq('1');
    });
  });
});
