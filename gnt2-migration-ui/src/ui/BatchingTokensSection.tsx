import React, {Dispatch, SetStateAction} from 'react';
import {ContractTransaction} from 'ethers';
import {formatValue} from '../utils/formatter';
import {BalanceBlock, Ticker, BalanceRow, AmountWrapper, Amount, BalanceButton} from './Account/Balance';
import {useServices} from './hooks/useServices';
import {useProperty} from './hooks/useProperty';
import {isEmpty} from '../utils/bigNumberUtils';
import {TitleWithTooltip} from './commons/Text/TitleWithTooltip';

interface BatchingTokensSectionProps {
  setCurrentTransaction: Dispatch<SetStateAction<(() => Promise<ContractTransaction>) | undefined>>;
}

export const BatchingTokensSection = ({setCurrentTransaction}: BatchingTokensSectionProps) => {
  const {tokensService, connectionService} = useServices();
  const account = useProperty(connectionService.account);

  const batchingTokensBalance = useProperty(tokensService.gntbBalance);

  const unwrapTokens = async () => {
    setCurrentTransaction(() => () => tokensService.unwrap(account));
  };

  if (isEmpty(batchingTokensBalance)) {
    return null;
  }

  return (
    <BalanceBlock>
      <TitleWithTooltip
        tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vehicula vehicula odio, ut scelerisque massa.Learn more"
      >
        Wrapped Tokens
      </TitleWithTooltip>
      <BalanceRow>
        <Ticker>GNTb</Ticker>
        <AmountWrapper>
          <Amount data-testid='GNTB-balance'>{batchingTokensBalance && formatValue(batchingTokensBalance.toString(), 3)}</Amount>
          <BalanceButton
            data-testid="unwrap-tokens-button"
            onClick={unwrapTokens}
          >
            Unwrap
          </BalanceButton>
        </AmountWrapper>
      </BalanceRow>
    </BalanceBlock>
  );
};
