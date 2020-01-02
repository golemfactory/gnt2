import React, {useState} from 'react';
import {useServices} from './useServices';
import {useAsync} from './hooks/useAsync';
import {formatValue} from '../utils/formatter';

export const Account = () => {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<string | undefined>(undefined);
  const [oldTokensBalance, setOldTokensBalance] = useState<string | undefined>(undefined);
  const [newTokensBalance, setNewTokensBalance] = useState<string | undefined>(undefined);
  const [migrateTokens, setMigrateTokens] = useState('');
  const [refresh, setRefresh] = useState(false);

  const {accountService, tokensService} = useServices();

  useAsync(async () => {
    setAddress(await accountService.getDefaultAccount());
    setBalance(formatValue((await accountService.balanceOf(await accountService.getDefaultAccount())).toString(), 4));
    setOldTokensBalance(formatValue((await tokensService.balanceOfOldTokens(await accountService.getDefaultAccount())).toString(), 3));
    setNewTokensBalance(formatValue((await tokensService.balanceOfNewTokens(await accountService.getDefaultAccount())).toString(), 3));
  }, [refresh]);

  const migrateFrom = async () => {
    await tokensService.migrateFrom(migrateTokens);
    setRefresh(!refresh);
  };

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
      <div>
        <input data-testid="input" value={migrateTokens} onChange={event => setMigrateTokens(event.target.value)}/>
        <button data-testid="button" onClick={migrateFrom}>
            Migrate
        </button>
      </div>
    </div>
  );
};
