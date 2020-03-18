import {BigNumberish} from 'ethers/utils';
import {convertBalanceToBigJs} from './bigNumberUtils';

export const formatValue = (value: BigNumberish, digits: number) => {
  return convertBalanceToBigJs(value).toFixed(digits);
};
