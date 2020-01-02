import {BigNumberish, formatEther} from 'ethers/utils';
import {Big} from 'big.js';

export const formatValue = (value: BigNumberish, digits: number) => {
  return new Big(formatEther(value)).toFixed(digits);
};
