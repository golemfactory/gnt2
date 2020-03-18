import {BigNumber, BigNumberish, formatEther} from 'ethers/utils';
import {Big} from 'big.js';

export const isEmpty = (balance: BigNumber | undefined) => {
  return !balance || balance.eq(0);
};

export const convertBalanceToBigJs = (balance: BigNumberish) => {
  return new Big(formatEther(balance));
};
