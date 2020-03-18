import React, {useState} from 'react';
import {ContractTransaction} from 'ethers';

import {TransactionStatus} from './TransactionStatus';
import {DepositTimer} from './DepositTimer';
import {useServices} from './hooks/useServices';
import {useAsyncEffect} from './hooks/useAsyncEffect';
import {useProperty} from './hooks/useProperty';
import {DepositState} from '../services/TokensService';
import {isEmpty} from '../utils/bigNumberUtils';
import {BalanceBlock, BalanceRow, Ticker, AmountWrapper, Amount, BalanceButton} from './Account/Balance';
import {SmallTitle} from './commons/Text/SmallTitle';
import {formatValue} from '../utils/formatter';
import lockIcon from '../assets/icons/lock.svg';
import styled from 'styled-components';

export function DepositSection() {
  const {tokensService, connectionService} = useServices();

  const account = useProperty(connectionService.account);

  const [currentTransaction, setCurrentTransaction] = useState<(() => Promise<ContractTransaction>) | undefined>(undefined);
  const [depositLockState, setDepositLockState] = useState<DepositState>(DepositState.LOCKED);

  const depositBalance = useProperty(tokensService.depositBalance);

  useAsyncEffect(async () => {
    setDepositLockState(await tokensService.getDepositState(account));
  }, [account, tokensService, currentTransaction]);

  const changeDepositState = async () => {
    if (currentTransaction) return null;

    if (depositLockState === DepositState.LOCKED) {
      setCurrentTransaction(() => () => tokensService.unlockDeposit(account));
    } else if (depositLockState === DepositState.UNLOCKED) {
      setCurrentTransaction(() => () => tokensService.moveToWrapped(account));
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

  if (isEmpty(depositBalance)) {
    return null;
  }

  return (
    <BalanceBlock>
      <SmallTitle>Locked Tokens</SmallTitle>
      <BalanceRow>
        <TokenTicker>GNTb</TokenTicker>
        <AmountWrapper>
          <Amount data-testid='deposit'>{depositBalance && formatValue(depositBalance.toString(), 3)}</Amount>
          <BalanceButton
            data-testid="action-deposit-button"
            disabled={depositLockState === DepositState.TIME_LOCKED}
            onClick={() => changeDepositState()}
          >
            {getTitle()}
          </BalanceButton>
        </AmountWrapper>
      </BalanceRow>
      <DepositTimer/>
      <TransactionStatus onClose={() => closeTransactionModal() } transactionToBeExecuted={currentTransaction}/>
    </BalanceBlock>
  );
}

const TokenTicker = styled(Ticker)`
  position: relative;
  padding-left: 32px;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    background: url(${lockIcon}) center no-repeat;
  }
`;
