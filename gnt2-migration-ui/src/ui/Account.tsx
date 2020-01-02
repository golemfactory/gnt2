import React, {useState} from 'react';
import {useServices} from './useServices';
import {useAsync} from './hooks/useAsync';
import {formatValue} from '../utils/formatter';
import Jazzicon, {jsNumberForAddress} from 'react-jazzicon';

export const Account = () => {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<string | undefined>(undefined);
  const [oldTokensBalance, setOldTokensBalance] = useState<string | undefined>(undefined);
  const [newTokensBalance, setNewTokensBalance] = useState<string | undefined>(undefined);

  const {accountService, tokensService} = useServices();

  useAsync(async () => {
    setAddress(await accountService.getDefaultAccount());
    setBalance(formatValue((await accountService.balanceOf(await accountService.getDefaultAccount())).toString(), 4));
    setOldTokensBalance(formatValue((await tokensService.balanceOfOldTokens(await accountService.getDefaultAccount())).toString(), 3));
    setNewTokensBalance(formatValue((await tokensService.balanceOfNewTokens(await accountService.getDefaultAccount())).toString(), 3));
  }, []);

  return (
    <div>
      <div>Your address:</div>
      <div>
        {address && <Jazzicon diameter={46} seed={jsNumberForAddress(address)}/>}
        <div>{address}</div>
      </div>
      <div>Your ETH balance:</div>
      {balance && <div data-testid='ETH-balance'>{balance}</div>}
      <div>Your NGNT balance:</div>
      {newTokensBalance && <div data-testid='NGNT-balance'>{newTokensBalance}</div>}
      <div>Your GNT balance:</div>
      {oldTokensBalance && <div data-testid='GNT-balance'>{oldTokensBalance}</div>}
    </div>
  );
};
