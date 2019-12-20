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
      <div>Your NGNT balance:</div>
      <div data-test-id='NGNT'>{balance}</div>
      <div>Your GNT balance:</div>
      <div data-test-id='GNT'>{balance}</div>
    </div>
  );
};
