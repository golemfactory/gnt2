import React, {useState} from 'react';
import {useServices} from './useServices';
import styled from 'styled-components';
import {BigNumber} from 'ethers/utils';
import {useProperty} from './hooks/useProperty';
import {useSnackbar} from './hooks/useSnackbar';
import Jazzicon, {jsNumberForAddress} from 'react-jazzicon';
import {Modal} from './Modal';
import {useModal} from './hooks/useModal';
import {TransactionProgress} from './TransactionProgres';
import {CTAButton} from './commons/CTAButton';
import {BalancesSection} from './BalancesSection';

export const Account = () => {
  const {tokensService, contractAddressService, connectionService} = useServices();
  const {show} = useSnackbar();

  const contractAddresses = useProperty(contractAddressService.contractAddresses);
  const account = useProperty(connectionService.account);
  const [refresh, setRefresh] = useState(false);
  const deps = [account, contractAddresses, refresh];

  const [transactionHash, setTransactionHash] = useState<string | undefined>('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [txInProgress, setTxInProgress] = useState(false);
  const [isTransactionModalVisible, openTransactionModal, closeTransactionModal] = useModal();
  const [oldTokensBalance, setOldTokensBalance] = useState<BigNumber | undefined>(undefined);

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

  return (
    <div>
      <div>Your address:</div>
      <JazziconAddress>
        {account && <Jazzicon diameter={46} seed={jsNumberForAddress(account)}/>}
        <Address>{account}</Address>
      </JazziconAddress>
      <BalancesSection deps={deps} setGNTBalance={setOldTokensBalance}/>
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
