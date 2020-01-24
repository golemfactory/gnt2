import React, {useState} from 'react';
import {useServices} from './useServices';
import {formatValue} from '../utils/formatter';
import styled from 'styled-components';
import {BigNumber} from 'ethers/utils';
import {useAsyncEffect} from './hooks/useAsyncEffect';
import {useProperty} from './hooks/useProperty';
import {useSnackbar} from './hooks/useSnackbar';
import Jazzicon, {jsNumberForAddress} from 'react-jazzicon';

export const Account = () => {
  const [balance, setBalance] = useState<BigNumber | undefined>(undefined);
  const [oldTokensBalance, setOldTokensBalance] = useState<BigNumber | undefined>(undefined);
  const [newTokensBalance, setNewTokensBalance] = useState<BigNumber | undefined>(undefined);
  const [batchingTokensBalance, setBatchingTokensBalance] = useState<BigNumber | undefined>(undefined);
  const [refresh, setRefresh] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | undefined>('');

  const {accountService, tokensService, contractAddressService, connectionService} = useServices();
  const tokenAdresses = useProperty(contractAddressService.golemNetworkTokenAddress);
  const account = useProperty(connectionService.account);
  const {show} = useSnackbar();

  useAsyncEffect(async () => {
    setBalance(await accountService.balanceOf(account));
    setOldTokensBalance(await tokensService.balanceOfOldTokens(account));
    setNewTokensBalance(await tokensService.balanceOfNewTokens(account));
    setBatchingTokensBalance(await tokensService.balanceOfBatchingTokens(account));
  }, [refresh, account, tokenAdresses]);

  const migrateTokens = async () => {
    try {
      const tx = await tokensService.migrateAllTokens(account);
      setTransactionHash(tx);
      setRefresh(!refresh);
    } catch (e) {
      show(e.message);
    }
  };

  const format = (value: BigNumber, digits = 3) => formatValue(value.toString(), digits);

  return (
    <div>
      <div>Your address:</div>
      <JazziconAddress>
        {account && <Jazzicon diameter={46} seed={jsNumberForAddress(account)}/>}
        <Address>{account}</Address>
      </JazziconAddress>
      <div>Your NGNT balance:</div>
      {newTokensBalance && <div data-testid='NGNT-balance'>{format(newTokensBalance)}</div>}
      <div>Your GNT balance:</div>
      {oldTokensBalance && <div data-testid='GNT-balance'>{format(oldTokensBalance)}</div>}
      <div>Your GNTB balance:</div>
      {batchingTokensBalance && <div data-testid='GNTB-balance'>{format(batchingTokensBalance)}</div>}
      <div>Your ETH balance:</div>
      {balance && <div data-testid='ETH-balance'>{format(balance, 4)}</div>}
      <Migrate data-testid="button" onClick={migrateTokens} disabled={oldTokensBalance?.eq(new BigNumber('0'))}>
        Migrate
      </Migrate>
      {transactionHash && <div>{transactionHash}</div>}
    </div>
  );
};

const JazziconAddress = styled.div`
  display: flex;
  align-items: center;
`;

const Address = styled.div`
  margin-left: 8px;
`;

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
