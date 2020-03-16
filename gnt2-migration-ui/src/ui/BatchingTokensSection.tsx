import React, {useState} from 'react';
import {ContractTransaction} from 'ethers';

import {Balance} from './Balance';
import {useServices} from './hooks/useServices';
import {TransactionStatus} from './TransactionStatus';
import {useProperty} from './hooks/useProperty';
import {CTAButton} from './commons/CTAButton';
import {isEmpty} from '../utils/bigNumberUtils';

export const BatchingTokensSection = () => {
  const {tokensService, connectionService} = useServices();
  const account = useProperty(connectionService.account);

  const [isBtnClicked, setBtnClicked] = React.useState(false);

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
    <>
      <Balance testId='GNTB-balance' tokenName='GNTB' balance={batchingTokensBalance}/>
      <CTAButton
        data-testid="unwrap-tokens-button"
        disabled={isBtnClicked}
        onClick={() => unwrapTokens()}
      >
        Unwrap
      </CTAButton>
      <TransactionStatus onClose={() => closeTransactionModal()} transactionToBeExecuted={currentTransaction}/>
    </>
  );
};
