import React, {useState} from 'react';

import styled from 'styled-components';
import {ContractTransaction} from 'ethers';
import {BigNumber} from 'ethers/utils';
import Jazzicon, {jsNumberForAddress} from 'react-jazzicon';

import {TransactionStatus} from './TransactionStatus';
import {BalancesSection} from './BalancesSection';
import {useServices} from './useServices';
import {useProperty} from './hooks/useProperty';
import {CTAButton} from './commons/CTAButton';

export const Account = () => {
  const {tokensService, connectionService} = useServices();

  const account = useProperty(connectionService.account);

  const [refresh, setRefresh] = useState(false);
  const [oldTokensBalance, setOldTokensBalance] = useState<BigNumber | undefined>(undefined);
  const [currentTransaction, setCurrentTransaction] = useState<(() => Promise<ContractTransaction>) | undefined>(undefined);

  const refreshBalances = () => setRefresh(!refresh);

  const migrateTokens = () => setCurrentTransaction(() => () => tokensService.migrateAllTokens(account));

  const closeTransactionModal = () => {
    setCurrentTransaction(undefined);
  };

  return (
    <div>
      <div>Your address:</div>
      <JazziconAddress>
        {account && <Jazzicon diameter={46} seed={jsNumberForAddress(account)}/>}
        <Address>{account}</Address>
      </JazziconAddress>
      <BalancesSection refreshTrigger={refresh} setGNTBalance={setOldTokensBalance}/>
      <CTAButton data-testid="migrate-button" onClick={migrateTokens} disabled={oldTokensBalance?.eq(new BigNumber('0'))}>
        Migrate
      </CTAButton>
      <TransactionStatus onClose={() => closeTransactionModal() } transactionToBeExecuted={currentTransaction} refreshTrigger={() => refreshBalances()}/>
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
