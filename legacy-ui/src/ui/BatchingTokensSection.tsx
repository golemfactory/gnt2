import React from 'react';
import {formatTokenBalance} from '../utils/formatter';
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
        tooltipText="GNTb: wrapped tokens used within Golem Network (batched to decrease tx fees).
         You have to unwrap these tokens into GNT before you do the migration."
      >
        Wrapped Tokens
      </TitleWithTooltip>
      <BalanceRow>
        <Ticker>GNTb</Ticker>
        <Amount data-testid='GNTB-balance'>{formatTokenBalance(batchingTokensBalance)}</Amount>
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
