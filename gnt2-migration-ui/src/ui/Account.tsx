import React, {useState} from 'react';

import styled from 'styled-components';
import {ContractTransaction} from 'ethers';
import {BigNumber, parseEther} from 'ethers/utils';
import Jazzicon, {jsNumberForAddress} from 'react-jazzicon';
import {SmallTitle} from './commons/Text/SmallTitle';
import {TransactionStatus} from './TransactionStatus';
import {BalancesSection} from './Account/BalancesSection';
import {useServices} from './hooks/useServices';
import {useProperty} from './hooks/useProperty';
import {CTAButton} from './commons/CTAButton';
import {DashboardLayout} from './commons/DashboardLayout/DashboardLayout';
import {formatValue} from '../utils/formatter';
import {Big} from 'big.js';
import {convertBalanceToBigJs} from '../utils/bigNumberUtils';

export const Account = () => {
  const {tokensService, connectionService} = useServices();

  const account = useProperty(connectionService.account);

  const oldTokensBalance = useProperty(tokensService.gntBalance);
  const [currentTransaction, setCurrentTransaction] = useState<(() => Promise<ContractTransaction>) | undefined>(undefined);
  const [tokensToMigrate, setTokensToMigrate] = React.useState<string>('0.000');
  const [migrateError, setMigrateError] = React.useState<string | undefined>(undefined);

  const tokensToMigrateAsNumber = () => new Big(tokensToMigrate);

  const format = (value: BigNumber) => formatValue(value.toString(), 3);

  function invalidTokensToMigrate() {
    return !oldTokensBalance ||
      tokensToMigrateAsNumber().gt(convertBalanceToBigJs(oldTokensBalance)) ||
      tokensToMigrateAsNumber().lte(0);
  }

  const migrateTokens = () => {
    if (invalidTokensToMigrate()) {
      setMigrateError('Invalid number of tokens to migrate');
      setTimeout(() => setMigrateError(undefined), 4000);
      return;
    }
    setCurrentTransaction(() => () => tokensService.migrateTokens(account, parseEther(tokensToMigrate)));
  };

  const closeTransactionModal = () => {
    setCurrentTransaction(undefined);
    setTokensToMigrate('0.000');
  };

  return (
    <DashboardLayout>
      <View>
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
        <BalancesSection/>
        <br/>
        {
          oldTokensBalance &&
          <>
            <CTAButton
              data-testid="migrate-button"
              onClick={migrateTokens}
              disabled={tokensToMigrate === '0.000' || !tokensToMigrate || oldTokensBalance?.eq(new BigNumber('0'))}
            >
              Migrate
            </CTAButton>
            <CTAButton
              data-testid="migrate-btn-set-max"
              onClick={() => setTokensToMigrate(convertBalanceToBigJs(oldTokensBalance).toString())}
            >
              Set max
            </CTAButton>
            <Input
              data-testid="migrate-input"
              placeholder='Number of tokens to migrate'
              type='number'
              max={format(new BigNumber(oldTokensBalance))}
              min='0.000'
              step='0.001'
              value={tokensToMigrate}
              onChange={e => setTokensToMigrate(e.target.value)}
            />
            {
              migrateError &&
              <ErrorInfo data-testid='migrate-error'>
                {migrateError}
              </ErrorInfo>
            }
          </>
        }
        <TransactionStatus onClose={() => closeTransactionModal()} transactionToBeExecuted={currentTransaction}/>
      </View>
    </DashboardLayout>
  );
};

const ErrorInfo = styled.p`
  font-size: 14px;
  color: #990000;
`;

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

const Input = styled.input`
  height: 40px;
  width: 70%;
  padding: 6px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;
