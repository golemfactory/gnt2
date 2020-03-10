import React, {useState} from 'react';
import {ContractTransaction} from 'ethers';
import {BigNumber} from 'ethers/utils';

import {TransactionStatus} from './TransactionStatus';
import {Balance} from './Balance';
import {DepositTimer} from './DepositTimer';
import {useServices} from './useServices';
import {useAsync} from './hooks/useAsync';
import {useAsyncEffect} from './hooks/useAsyncEffect';
import {CTAButton} from './commons/CTAButton';
import {useProperty} from './hooks/useProperty';
import {DepositState} from '../services/TokensService';

export function DepositSection() {
  const {tokensService, connectionService, contractAddressService} = useServices();

  const account = useProperty(connectionService.account);
  const contractAddresses = useProperty(contractAddressService.contractAddresses);

  const [currentTransaction, setCurrentTransaction] = useState<(() => Promise<ContractTransaction>) | undefined>(undefined);
  const [depositLockState, setDepositLockState] = useState<DepositState>(DepositState.LOCKED);

  const [depositBalance] = useAsync(
    async () => tokensService.balanceOfDepositTokens(account),
    [contractAddresses, account, depositLockState]);

  useAsyncEffect(async () => {
    setDepositLockState(await tokensService.isDepositLocked(account));
  }, [account, tokensService, currentTransaction]);

  function exists(balance: BigNumber | undefined) {
    return balance && !balance?.eq(0);
  }

  const unlockDeposit = () => setCurrentTransaction(() => () => tokensService.unlockDeposit());

  const closeTransactionModal = () => {
    setCurrentTransaction(undefined);
  };

  if (!exists(depositBalance)) {
    return null;
  }

  return (
    <>
      <Balance testId='deposit' tokenName='deposit' balance={depositBalance}/>
      <DepositTimer/>
      <CTAButton
        data-testid="action-deposit-button"
        disabled={depositLockState === DepositState.TIME_LOCKED}
        onClick={() => unlockDeposit()}
      >
        {depositLockState === 0 ? 'Unlock' : 'Time lock'}
      </CTAButton>
      <TransactionStatus onClose={() => closeTransactionModal() } transactionToBeExecuted={currentTransaction}/>
    </>
  );
}
