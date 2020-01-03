import React, {useState} from 'react';
import {useServices} from './useServices';
import {useAsync} from './hooks/useAsync';
import {formatValue} from '../utils/formatter';
import styled from 'styled-components';
import {BigNumber} from 'ethers/utils';

export const Account = () => {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<BigNumber | undefined>(undefined);
  const [oldTokensBalance, setOldTokensBalance] = useState<BigNumber | undefined>(undefined);
  const [newTokensBalance, setNewTokensBalance] = useState<BigNumber | undefined>(undefined);
  const [refresh, setRefresh] = useState(false);

  const {accountService, tokensService} = useServices();

  useAsync(async () => {
    setAddress(await accountService.getDefaultAccount());
    setBalance(await accountService.balanceOf(await accountService.getDefaultAccount()));
    setOldTokensBalance(await tokensService.balanceOfOldTokens(await accountService.getDefaultAccount()));
    setNewTokensBalance(await tokensService.balanceOfNewTokens(await accountService.getDefaultAccount()));
  }, [refresh]);

  const migrateTokens = async () => {
    await tokensService.migrateTokens((await tokensService.balanceOfOldTokens(await accountService.getDefaultAccount())).toString());
    setRefresh(!refresh);
  };

  const format = (value: BigNumber, digits = 3) => formatValue(value.toString(), digits);

  return (
    <div>
      <div>Your address:</div>
      <div>{address}</div>
      <div>Your NGNT balance:</div>
      {newTokensBalance && <div data-testid='NGNT-balance'>{format(newTokensBalance)}</div>}
      <div>Your GNT balance:</div>
      {oldTokensBalance && <div data-testid='GNT-balance'>{format(oldTokensBalance)}</div>}
      <div>Your ETH balance:</div>
      {balance && <div data-testid='ETH-balance'>{format(balance, 4)}</div>}
      <Migrate data-testid="button" onClick={migrateTokens} disabled={oldTokensBalance?.eq(new BigNumber('0'))}>
          Migrate
      </Migrate>
    </div>
  );
};

const Migrate = styled.button`
  background-color: #181EA9;
  border: none;
  color: white;
  padding: 15px 32px;
  margin: 12px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  border-radius: 8px;
  &:disabled {
    opacity: 0.3;
    background: grey;
  }
`;
