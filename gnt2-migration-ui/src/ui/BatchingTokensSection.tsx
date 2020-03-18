import React, {useState} from 'react';
import {ContractTransaction} from 'ethers';
import {formatValue} from '../utils/formatter';
import {BalanceBlock, Ticker, BalanceRow, AmountWrapper, Amount, BalanceButton} from './Account/Balance';
import {useServices} from './hooks/useServices';
import {TransactionStatus} from './TransactionStatus';
import {useProperty} from './hooks/useProperty';
import {isEmpty} from '../utils/bigNumberUtils';
import {TitleWithTooltip} from './commons/Text/TitleWithTooltip';

export const BatchingTokensSection = () => {
  const {tokensService, connectionService} = useServices();
  const account = useProperty(connectionService.account);

  const [isBtnClicked, setBtnClicked] = useState(false);

  const batchingTokensBalance = useProperty(tokensService.gntbBalance);
  const [currentTransaction, setCurrentTransaction] = useState<(() => Promise<ContractTransaction>) | undefined>(undefined);

  const unwrapTokens = async () => {
    setBtnClicked(true);
    setCurrentTransaction(() => () => tokensService.unwrap(account));
  };

  const closeTransactionModal = () => {
    setCurrentTransaction(undefined);
    setBtnClicked(false);
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
            disabled={isBtnClicked}
            onClick={unwrapTokens}
          >
            Unwrap
          </BalanceButton>
        </AmountWrapper>
        <TransactionStatus onClose={() => closeTransactionModal()} transactionToBeExecuted={currentTransaction}/>
      </BalanceRow>
    </BalanceBlock>
  );
};
