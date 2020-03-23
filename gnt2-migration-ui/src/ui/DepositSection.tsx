import React, {useEffect, useState} from 'react';
import {DepositTimer} from './DepositTimer';
import {useServices} from './hooks/useServices';
import {useProperty} from './hooks/useProperty';
import {DepositState} from '../services/TokensService';
import {isEmpty} from '../utils/bigNumberUtils';
import {Amount, AmountWrapper, BalanceBlock, BalanceButton, BalanceRow, Ticker} from './Account/Balance';
import {formatTokenBalance} from '../utils/formatter';
import lockIcon from '../assets/icons/lock.svg';
import styled from 'styled-components';
import {TitleWithTooltip} from './commons/Text/TitleWithTooltip';

interface DepositSectionProps {
  onMoveToWrapped: () => void;
  onUnlock: () => void;
}

export function DepositSection({onMoveToWrapped, onUnlock}: DepositSectionProps) {
  const {tokensService} = useServices();
  const depositBalance = useProperty(tokensService.depositBalance);
  const depositLockState = useProperty(tokensService.depositLockState);
  const [depositText, setDepositText] = useState('');

  const changeDepositState = async () => {
    if (depositLockState === DepositState.LOCKED) {
      onUnlock();
    } else if (depositLockState === DepositState.UNLOCKED) {
      onMoveToWrapped();
    }
  };

  useEffect(() => {
    switch (depositLockState) {
      case DepositState.EMPTY:
        setDepositText('is empty');
        break;
      case DepositState.UNLOCKED:
        setDepositText('is unlocked');
        break;
      case DepositState.TIME_LOCKED:
        setDepositText('is time-locked');
        break;
      default:
        setDepositText('is locked');
    }
  }, [depositLockState]);

  const getTitle = () => {
    switch (depositLockState) {
      case DepositState.LOCKED:
        return 'Unlock';
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
      <TitleWithTooltip
        data-testid='deposit-status'
        tooltipText={`Deposit ${depositText}`}
      >
        Locked Tokens
      </TitleWithTooltip>
      <BalanceRow>
        <DepositTicker isLocked={depositLockState === DepositState.LOCKED || depositLockState === DepositState.TIME_LOCKED}>GNTb</DepositTicker>
        <AmountWrapper>
          <Amount data-testid='deposit'>{formatTokenBalance(depositBalance)}</Amount>
          {depositLockState === DepositState.TIME_LOCKED
            ? <DepositTimer/>
            : <BalanceButton
              data-testid="action-deposit-button"
              onClick={() => changeDepositState()}
            >
              {getTitle()}
            </BalanceButton>
          }
        </AmountWrapper>
      </BalanceRow>
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
