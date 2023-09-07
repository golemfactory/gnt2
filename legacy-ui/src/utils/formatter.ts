import {BigNumberish} from 'ethers/utils';
import {convertBalanceToBigJs} from './bigNumberUtils';
import {PossibleBalance} from '../domain/PossibleBalance';

export const formatValue = (value: BigNumberish, digits: number) => {
  return convertBalanceToBigJs(value).toFixed(digits);
};

export const formatTokenBalance = (value: PossibleBalance) => {
  return value ? formatValue(value, 4) : '';
};
