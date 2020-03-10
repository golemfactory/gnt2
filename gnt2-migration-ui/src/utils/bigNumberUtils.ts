import {BigNumber} from 'ethers/utils';

export const isEmpty = (balance: BigNumber | undefined) => {
  return !balance || balance.eq(0);
};
