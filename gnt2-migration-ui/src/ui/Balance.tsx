import React from 'react';
import {BigNumber} from 'ethers/utils';
import {formatValue} from '../utils/formatter';

interface BalanceProps {
  tokenName: string;
  balance: BigNumber | undefined;
  digits?: number;
  testId?: string;
}

export const Balance = ({tokenName, balance, digits = 3, testId}: BalanceProps) => {
  const format = (value: BigNumber) => formatValue(value.toString(), digits);
  return (<>
    <div>Your {tokenName} balance:</div>
    {balance && <div data-testid={testId}>{format(balance)}</div>}
  </>);
};
