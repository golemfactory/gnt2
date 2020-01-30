import React, {useState} from 'react';
import {useServices} from './useServices';
import {formatValue} from '../utils/formatter';
import styled from 'styled-components';
import {BigNumber} from 'ethers/utils';
import {useAsyncEffect} from './hooks/useAsyncEffect';
import {useProperty} from './hooks/useProperty';
import {useSnackbar} from './hooks/useSnackbar';
import Jazzicon, {jsNumberForAddress} from 'react-jazzicon';
import {Modal} from './Modal';
import {useModal} from './hooks/useModal';
import {TransactionProgress} from './TransactionProgres';
import {CTAButton} from './commons/CTAButton';


export const Account = () => {
  const [balance, setBalance] = useState<BigNumber | undefined>(undefined);
  const [oldTokensBalance, setOldTokensBalance] = useState<BigNumber | undefined>(undefined);
  const [newTokensBalance, setNewTokensBalance] = useState<BigNumber | undefined>(undefined);
  const [batchingTokensBalance, setBatchingTokensBalance] = useState<BigNumber | undefined>(undefined);
  const [depositTokensBalance, setDepositTokensBalance] = useState<BigNumber | undefined>(undefined);
  const [refresh, setRefresh] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | undefined>('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [txInProgress, setTxInProgress] = useState(false);
  const [isTransactionModalVisible, openTransactionModal, closeTransactionModal] = useModal();


  const {accountService, tokensService, contractAddressService, connectionService} = useServices();
  const tokenAddresses = useProperty(contractAddressService.golemNetworkTokenAddress);
  const account = useProperty(connectionService.account);
  const {show} = useSnackbar();

  useAsyncEffect(async () => {
    setBalance(await accountService.balanceOf(account));
    setOldTokensBalance(await tokensService.balanceOfOldTokens(account));
    setNewTokensBalance(await tokensService.balanceOfNewTokens(account));
    setBatchingTokensBalance(await tokensService.balanceOfBatchingTokens(account));
    setDepositTokensBalance(await tokensService.balanceOfDepositTokens(account));
  }, [refresh, account, tokenAddresses]);

  const migrateTokens = async () => {
    setTransactionHash(undefined);
    setErrorMessage(undefined);
    try {
      openTransactionModal();
      setTxInProgress(true);
      const tx = await tokensService.migrateAllTokens(account);
      setTransactionHash(tx);
      setTxInProgress(false);
      setRefresh(!refresh);
    } catch (e) {
      show(e.message);
      setErrorMessage(e.message);
      setTxInProgress(false);
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
      <div>Your deposit balance:</div>
      {depositTokensBalance && <div data-testid='deposit'>{format(depositTokensBalance)}</div>}
      <div>Your ETH balance:</div>
      {balance && <div data-testid='ETH-balance'>{format(balance, 4)}</div>}
      <CTAButton data-testid="button" onClick={migrateTokens} disabled={oldTokensBalance?.eq(new BigNumber('0'))}>
        Migrate
      </CTAButton>
      {isTransactionModalVisible &&
      <Modal onClose={closeTransactionModal} inProgress={txInProgress}>
        <TransactionProgress transactionHash={transactionHash} errorMessage={errorMessage}/>
      </Modal>}
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
