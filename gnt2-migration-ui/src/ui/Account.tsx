import React, {useState} from 'react';
import {useServices} from './useServices';
import {useAsync} from './hooks/useAsync';

export const Account = () => {
  const [address, setAddress] = useState('<unknown>');
  const [balance, setBalance] = useState('<unknown>');

  const {accountService} = useServices();

  useAsync(async () => {
    const account = await accountService.getDefaultAccount();
    setAddress(account);
    const balance = (await accountService.balanceOf(account)).toString();
    setBalance(balance || '');
  }, []);

  return (
    <div>
      <div>Your address:</div>
      <div> {address}</div>
      <div>Your balance:</div>
      <div>{balance}</div>
    </div>
  );
};
