import React, {useEffect, useState} from 'react';
import {useAsync} from './hooks/useAsync';
import {useServices} from './useServices';
import {useProperty} from './hooks/useProperty';
import {depositState} from '../services/TokensService';
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
      case depositState.EMPTY:
        setDepositText('is empty');
        break;
      case depositState.UNLOCK:
        setDepositText('is unlock');
        break;
      case depositState.TIMELOCK:
        if (timeLeft) {
          timer = Timer(timeLeft.toNumber() * 1000, setTimer);
        }
        setDepositText('is currently lock by time');
        break;
      default:
        setDepositText('is lock');
    }
    return () => { if (timer) { clearInterval(timer); } };
  }, [timeLeft, lock, account, contractAddresses]);

  return (<>
    <div>Deposit {depositText}</div>
    {timer && <div>Time left to unlock deposit: {timer}</div>}
  </>);
};
