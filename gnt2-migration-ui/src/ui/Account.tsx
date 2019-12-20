import React, {useState} from 'react';
import {useServices} from './useServices';
import {useAsync} from './hooks/useAsync';

export const Account = () => {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<string | undefined>(undefined);
  const [oldTokensBalance, setOldTokensBalance] = useState<string | undefined>(undefined);
  const [newTokensBalance, setNewTokensBalance] = useState<string | undefined>(undefined);

  const {accountService, tokensService} = useServices();

  useAsync(async () => {
    setAddress(await accountService.getDefaultAccount());
    setBalance((await accountService.balanceOf(await accountService.getDefaultAccount())).toString());
    setOldTokensBalance((await tokensService.balanceOfOldTokens(await accountService.getDefaultAccount())).toString());
    setNewTokensBalance((await tokensService.balanceOfNewTokens(await accountService.getDefaultAccount())).toString());
  }, []);

  return (
    <div>
      <div>Your address:</div>
      <div>{address}</div>
      <div>Your ETH balance:</div>
      {balance && <div data-testid='ETH-balance'>{balance}</div>}
      <div>Your NGNT balance:</div>
      {newTokensBalance && <div data-testid='NGNT-balance'>{newTokensBalance}</div>}
      <div>Your GNT balance:</div>
      {oldTokensBalance && <div data-testid='GNT-balance'>{oldTokensBalance}</div>}
    </div>
  );
};
