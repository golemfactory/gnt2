import React from 'react';
import {formatValue} from '../utils/formatter';
import {Amount, BalanceBlock, BalanceButton, BalanceRow, Ticker} from './Account/Balance';
import {useServices} from './hooks/useServices';
import {useProperty} from './hooks/useProperty';
import {isEmpty} from '../utils/bigNumberUtils';
import {TitleWithTooltip} from './commons/Text/TitleWithTooltip';

interface BatchingTokensSectionProps {
  onUnwrap: () => void;
}

export const BatchingTokensSection = ({onUnwrap}: BatchingTokensSectionProps) => {
  const {tokensService} = useServices();

  const batchingTokensBalance = useProperty(tokensService.gntbBalance);

  if (isEmpty(batchingTokensBalance)) {
    return null;
  }

  return (
    <BalanceBlock>
      <TitleWithTooltip
        tooltipText="GNTb: wrapped tokens used for batched transactions (to decrease the cost of transaction fees)
        in Golem Network. You have to unwrap those tokens into GNT before migration."
      >
        Wrapped Tokens
      </TitleWithTooltip>
      <BalanceRow>
        <Ticker>GNTb</Ticker>
        <Amount data-testid='GNTB-balance'>{batchingTokensBalance && formatValue(batchingTokensBalance.toString(), 3)}</Amount>
        <BalanceButton
          data-testid="unwrap-tokens-button"
          onClick={onUnwrap}
        >
          Unwrap
        </BalanceButton>
      </BalanceRow>
    </BalanceBlock>
  );
};
