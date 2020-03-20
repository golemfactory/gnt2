import React, {useState} from 'react';

import styled from 'styled-components';
import {ContractTransaction} from 'ethers';
import Jazzicon, {jsNumberForAddress} from 'react-jazzicon';
import {SmallTitle} from './commons/Text/SmallTitle';
import {TransactionStatus} from './TransactionStatus';
import {BalancesSection} from './Account/BalancesSection';
import {useServices} from './hooks/useServices';
import {useProperty} from './hooks/useProperty';
import {DashboardLayout} from './commons/DashboardLayout/DashboardLayout';
import {isEmpty} from '../utils/bigNumberUtils';
import {Modal} from './Modal';
import {CTAButton} from './commons/CTAButton';
import {ConvertTokens} from './Account/ConvertTokens';
import {parseEther} from 'ethers/utils';
import {formatTokenBalance} from '../utils/formatter';

export const Account = () => {
  const {tokensService, connectionService} = useServices();

  const account = useProperty(connectionService.account);

  const oldTokensBalance = useProperty(tokensService.gntBalance);
  const gntbBalance = useProperty(tokensService.gntbBalance);
  const depositBalance = useProperty(tokensService.depositBalance);
  const [currentTransaction, setCurrentTransaction] = useState<(() => Promise<ContractTransaction>) | undefined>(undefined);
  const [tokensToMigrate, setTokensToMigrate] = useState<string>('0.000');
  const [showOtherBalancesWarning, setShowOtherBalancesWarning] = React.useState(false);
  const [migrationStarted, setMigrationStarted] = useState(false);

  function hasOtherTokens() {
    return !(isEmpty(gntbBalance) && isEmpty(depositBalance));
  }

  const startMigration = () => {
    if (hasOtherTokens()) {
      setShowOtherBalancesWarning(true);
      return;
    }
    continueMigration();
  };

  const stopMigration = () => {
    setMigrationStarted(false);
  };

  const continueMigration = () => {
    setMigrationStarted(true);
  };

  const closeTransactionModal = () => {
    setCurrentTransaction(undefined);
    setTokensToMigrate('0.000');
    setMigrationStarted(false);
  };

  const closeOtherBalancesWarning = () => setShowOtherBalancesWarning(false);

  function migrate(amount: string) {
    setCurrentTransaction(() => () => tokensService.migrateTokens(account, parseEther(amount)));
  }

  return (
    <DashboardLayout>
      <View>
        {!currentTransaction && !migrationStarted &&
          <>
            <AddressBlock>
              {account &&
            <JazziconWrapper>
              <Jazzicon diameter={32} seed={jsNumberForAddress(account)}/>
            </JazziconWrapper>
              }
              <div>
                <AddressTitle>Address:</AddressTitle>
                <Address>{account}</Address>
              </div>
            </AddressBlock>
            <BalancesSection currentTransaction={currentTransaction} onConvert={startMigration} setCurrentTransaction={setCurrentTransaction}/>
          </>
        }
        {!currentTransaction && migrationStarted && oldTokensBalance &&
          <ConvertTokens
            onCancelClick={stopMigration}
            oldTokensBalance={oldTokensBalance}
            tokensToMigrate={tokensToMigrate}
            setTokensToMigrate={setTokensToMigrate}
            onAmountConfirm={(amount) => migrate(amount)}
          />
        }
        {currentTransaction &&
          <TransactionStatus
            onClose={() => closeTransactionModal()}
            transactionToBeExecuted={currentTransaction}
            description={`Migrating ${formatTokenBalance(oldTokensBalance)} GNT tokens`}
          />
        }
        <Modal isVisible={showOtherBalancesWarning} onClose={closeOtherBalancesWarning}>
          <h1>Warning</h1>
          <p>You are going to convert your GNT and you still have balance in GNTb and/or GNTb Deposit. If you plan to convert them later,
            additional Ethereum transactions will be required.</p>
          <CTAButton
            data-testid="continue-migrate-button"
            onClick={() => {
              closeOtherBalancesWarning();
              continueMigration();
            }}
          >
            OK, GOT IT
          </CTAButton>
          <a onClick={closeOtherBalancesWarning}>Cancel converting</a>
        </Modal>
      </View>
    </DashboardLayout>
  );
};

const View = styled.div`
  max-width: 630px;
  width: 100%;
  padding: 24px 0 0;
  border-top: 1px solid rgb(232, 232, 246);
`;

const JazziconWrapper = styled.div`
  margin-right: 24px;
`;

const AddressBlock = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0 26px;
  padding: 0 24px;
`;

const AddressTitle = styled(SmallTitle)`
  margin-bottom: 3px;
`;

const Address = styled.div`
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  color: #1722A2;
`;
