import React, {useEffect, useState} from 'react';
import {useAsync} from './hooks/useAsync';
import {useServices} from './useServices';
import {useProperty} from './hooks/useProperty';
import {DepositState} from '../services/TokensService';
import {Timer} from './commons/Timer';

export const DepositTimer = () => {
  const {tokensService, connectionService, contractAddressService} = useServices();
  const account = useProperty(connectionService.account);
  const contractAddresses = useProperty(contractAddressService.contractAddresses);
  const [lock] = useAsync(async () => tokensService.isDepositLocked(account), [contractAddresses, account]);
  const [depositText, setDepositText] = useState('');
  const [timeLeft] = useAsync(async () => tokensService.getDepositUnlockTime(account), [contractAddresses, account]);
  const [timer, setTimer] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTimer('');
    let timer: number;
    switch (lock) {
      case DepositState.EMPTY:
        setDepositText('is empty');
        break;
      case DepositState.UNLOCKED:
        setDepositText('is unlocked');
        break;
      case DepositState.TIME_LOCKED:
        if (timeLeft) {
          timer = Timer(timeLeft.toNumber() * 1000, setTimer);
        }
        setDepositText('is time-locked');
        break;
      default:
        setDepositText('is locked');
    }
    return () => { if (timer) { clearInterval(timer); } };
  }, [timeLeft, lock, account, contractAddresses]);


  return (
    <>
      <div data-testid='deposit-status'>Deposit {depositText}</div>
      {timer && <div data-testid='deposit-timer'>Time left to unlock deposit: {timer}</div>}
    </>
  );
};
