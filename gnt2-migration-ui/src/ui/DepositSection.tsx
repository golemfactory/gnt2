import React from 'react';
import {DepositTimer} from './DepositTimer';
import {useServices} from './hooks/useServices';
import {useProperty} from './hooks/useProperty';
import {DepositState} from '../services/TokensService';
import {isEmpty} from '../utils/bigNumberUtils';
import {Amount, AmountWrapper, BalanceBlock, BalanceButton, BalanceRow, Ticker} from './Account/Balance';
import {SmallTitle} from './commons/Text/SmallTitle';
import {formatTokenBalance} from '../utils/formatter';
import lockIcon from '../assets/icons/lock.svg';
import styled from 'styled-components';

interface DepositSectionProps {
  onMoveToWrapped: () => void;
  onUnlock: () => void;
}

export function DepositSection({onMoveToWrapped, onUnlock}: DepositSectionProps) {
  const {tokensService} = useServices();

  const depositBalance = useProperty(tokensService.depositBalance);
  const depositLockState = useProperty(tokensService.depositLockState);

  const changeDepositState = async () => {
    if (depositLockState === DepositState.LOCKED) {
      onUnlock();
    } else if (depositLockState === DepositState.UNLOCKED) {
      onMoveToWrapped();
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

  if (isEmpty(depositBalance)) {
    return null;
  }

  return (
    <BalanceBlock>
      <SmallTitle>Locked Tokens</SmallTitle>
      <BalanceRow>
        <DepositTicker isLocked={depositLockState === DepositState.LOCKED || depositLockState === DepositState.TIME_LOCKED}>GNTb</DepositTicker>
        <AmountWrapper>
          <Amount data-testid='deposit'>{formatTokenBalance(depositBalance)}</Amount>
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
    </BalanceBlock>
  );
}

interface DepositTickerProps {
  isLocked: boolean;
}

const DepositTicker = styled(Ticker)<DepositTickerProps>`

${({isLocked}) =>
    isLocked
      ? `
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
  `
      : ''}
`;
