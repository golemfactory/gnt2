import React from 'react';
import {BalanceBlock, BalanceRow, Ticker, AmountWrapper, Amount, BalanceButton} from './Balance';
import {formatValue} from '../../utils/formatter';
import {BigNumber} from 'ethers/utils';
import {TitleWithTooltip} from '../commons/Text/TitleWithTooltip';

interface OldTokensBalanceProps {
  balance: BigNumber | undefined;
  onConvert: () => void;
}

export const OldTokensBalance = ({balance, onConvert}: OldTokensBalanceProps) => {

  return (
    <BalanceBlock>
      <TitleWithTooltip
        tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vehicula vehicula odio, ut scelerisque massa.Learn more"
      >
        Golem Network Tokens
      </TitleWithTooltip>
      <BalanceRow>
        <Ticker>GNT</Ticker>
        <AmountWrapper>
          <Amount data-testid='GNT-balance'>{balance ? formatValue(balance.toString(), 3) : 0}</Amount>
          <BalanceButton data-testid='convert-button' onClick={onConvert} disabled={balance?.eq(new BigNumber('0'))}>Convert</BalanceButton>
        </AmountWrapper>
      </BalanceRow>
    </BalanceBlock>
  );
};
