import React, {useState} from 'react';

import styled from 'styled-components';
import {ContractTransaction} from 'ethers';
import {BigNumber} from 'ethers/utils';
import Jazzicon, {jsNumberForAddress} from 'react-jazzicon';

import {TransactionStatus} from './TransactionStatus';
import {BalancesSection} from './BalancesSection';
import {useServices} from './hooks/useServices';
import {useProperty} from './hooks/useProperty';
import {CTAButton} from './commons/CTAButton';
import {DashboardLayout} from './commons/DashboardLayout/DashboardLayout';

export const Account = () => {
  const {tokensService, connectionService} = useServices();

  const account = useProperty(connectionService.account);

  const [oldTokensBalance, setOldTokensBalance] = useState<BigNumber | undefined>(undefined);
  const [currentTransaction, setCurrentTransaction] = useState<(() => Promise<ContractTransaction>) | undefined>(undefined);

  const migrateTokens = () => setCurrentTransaction(() => () => tokensService.migrateAllTokens(account));

  const closeTransactionModal = () => {
    setCurrentTransaction(undefined);
  };

  return (
    <DashboardLayout>
      <div>Your address:</div>
      <JazziconAddress>
        {account && <Jazzicon diameter={46} seed={jsNumberForAddress(account)}/>}
        <Address>{account}</Address>
      </JazziconAddress>
      <BalancesSection setGNTBalance={setOldTokensBalance}/>
      <CTAButton data-testid="migrate-button" onClick={migrateTokens} disabled={oldTokensBalance?.eq(new BigNumber('0'))}>
        Migrate
      </CTAButton>
      <TransactionStatus onClose={() => closeTransactionModal() } transactionToBeExecuted={currentTransaction}/>
    </DashboardLayout>
  );
};

const JazziconAddress = styled.div`
  display: flex;
  align-items: center;
`;

const Address = styled.div`
  margin-left: 8px;
`;
