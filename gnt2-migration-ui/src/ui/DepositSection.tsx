import React, {useState} from 'react';
import {ContractTransaction} from 'ethers';
import {BigNumber} from 'ethers/utils';

import {TransactionStatus} from './TransactionStatus';
import {Balance} from './Balance';
import {DepositTimer} from './DepositTimer';
import {useServices} from './hooks/useServices';
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
    setDepositLockState(await tokensService.getDepositState(account));
  }, [account, tokensService, currentTransaction]);

  function exists(balance: BigNumber | undefined) {
    return balance && !balance?.eq(0);
  }

  const changeDepositState = async () => {
    if (currentTransaction) return null;

    if (depositLockState === DepositState.LOCKED) {
      setCurrentTransaction(() => () => tokensService.unlockDeposit());
    } else if (depositLockState === DepositState.UNLOCKED) {
      setCurrentTransaction(() => () => tokensService.moveToWrapped());
    }
  };

  const getTitle = () => {
    switch (depositLockState) {
      case DepositState.LOCKED:
        return 'Unlock';
      case DepositState.TIME_LOCKED:
        return 'Time lock';
      case DepositState.UNLOCKED:
        return 'Move to wrapped';
      default:
        return '';
    }
  };

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
        onClick={() => changeDepositState()}
      >
        {getTitle()}
      </CTAButton>
      <TransactionStatus onClose={() => closeTransactionModal() } transactionToBeExecuted={currentTransaction}/>
    </>
  );
}
