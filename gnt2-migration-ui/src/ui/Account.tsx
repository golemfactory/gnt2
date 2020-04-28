import React, {useEffect, useState} from 'react';

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
import {Modal} from './commons/Modal';
import {TxDetailsWithAmount} from './Account/TxDetailsWithAmount';
import {parseEther} from 'ethers/utils';
import {TxDetails} from './Account/TxDetails';
import {WarningModalContent} from './Account/WarningModalContent';
import {BlurModal} from './BlurModal';
import {DescribeAction} from './Account/AccountActionDescriptions';
import {useAsyncEffect} from './hooks/useAsyncEffect';
import {tokens} from '../domain/constants';
import {formatTokenBalance} from '../utils/formatter';

enum AccountActions {
  MIGRATE,
  UNWRAP,
  WITHDRAW,
  UNLOCK
}

export interface TransactionWithDescription {
  txFunction: () => Promise<ContractTransaction>;
  description: string;
}

export const Account = () => {
  const {tokensService, connectionService, contractAddressService, transactionService} = useServices();

  const account = useProperty(connectionService.address);
  const network = useProperty(connectionService.network);
  const hasContracts = useProperty(contractAddressService.hasContracts);

  const oldTokensBalance = useProperty(tokensService.gntBalance);
  const gntbBalance = useProperty(tokensService.gntbBalance);
  const depositBalance = useProperty(tokensService.depositBalance);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionWithDescription | undefined>(undefined);
  const [showOtherBalancesWarning, setOtherBalancesWarning] = useState<boolean>(false);
  const [showMigrationStoppedWarning, setMigrationStoppedWarning] = useState<boolean>(false);
  const [startedAction, setStartedAction] = useState<AccountActions | undefined>();
  const isMigrationTargetSetToZero = useProperty(tokensService.isMigrationTargetSetToZero);

  useAsyncEffect(async () => {
    if (transactionService.isTxStored()) {
      const txFromStore = await transactionService.getTxFromLocalStorage();
      setCurrentTransaction(txFromStore);
    } else {
      setCurrentTransaction(undefined);
    }
  }, [account, network]);

  useEffect(() => {
    if (isMigrationTargetSetToZero) {
      setMigrationStoppedWarning(true);
    } else {
      setMigrationStoppedWarning(false);
    }
  }, [isMigrationTargetSetToZero]);

  const hasOtherTokens = () => !(isEmpty(gntbBalance) && isEmpty(depositBalance));

  const startMigration = () => {
    if (hasOtherTokens()) {
      setOtherBalancesWarning(true);
      return;
    }
    continueMigration();
  };

  const continueMigration = () => {
    setStartedAction(AccountActions.MIGRATE);
  };

  const stopAction = () => {
    setStartedAction(undefined);
  };

  const startMoveToWrapped = () => {
    setStartedAction(AccountActions.WITHDRAW);
  };

  const startUnlock = () => {
    setStartedAction(AccountActions.UNLOCK);
  };

  const startUnwrap = () => {
    setStartedAction(AccountActions.UNWRAP);
  };

  const closeTransactionModal = () => {
    setCurrentTransaction(undefined);
    setStartedAction(undefined);
  };

  const closeOtherBalancesWarning = () => setOtherBalancesWarning(false);

  const closeMigrationStoppedWarning = () => setMigrationStoppedWarning(false);

  const migrate = (amount: string) => {
    setCurrentTransaction({
      txFunction: () => tokensService.migrateTokens(account, parseEther(amount)),
      description: `Ongoing transaction`
    });
  };

  const unwrapTokens = async (amount: string) => {
    setCurrentTransaction({
      txFunction: () => tokensService.unwrap(account, parseEther(amount)),
      description: `Unwrapping ${amount} GNTB tokens to GNT`
    });
  };

  const unlockDeposit = () => {
    setCurrentTransaction({txFunction: () => tokensService.unlockDeposit(account), description: 'Unlocking your GNTB deposit'});
  };

  const moveToWrapped = () => {
    setCurrentTransaction({
      txFunction: () => tokensService.moveToWrapped(account),
      description: `Withdrawing ${formatTokenBalance(depositBalance)} GNTB from your deposit`
    });
  };

  const renderContent = () => {
    switch (startedAction) {
      case AccountActions.MIGRATE:
        if (!oldTokensBalance) return null;
        return (
          <TxDetailsWithAmount
            onCancelClick={stopAction}
            onAmountConfirm={migrate}
            description={DescribeAction.migrate(oldTokensBalance)}
          />
        );
      case AccountActions.UNWRAP:
        if (!gntbBalance) return null;
        return (
          <TxDetailsWithAmount
            onCancelClick={stopAction}
            onAmountConfirm={unwrapTokens}
            description={DescribeAction.unwrap(gntbBalance)}
          />
        );
      case AccountActions.WITHDRAW:
        if (!depositBalance) return null;
        return (
          <TxDetails
            onCancelClick={stopAction}
            onConfirm={moveToWrapped}
            description={DescribeAction.withdraw(depositBalance)}
          />
        );
      case AccountActions.UNLOCK:
        if (!depositBalance) return null;
        return (
          <TxDetails
            onCancelClick={stopAction}
            onConfirm={unlockDeposit}
            description={DescribeAction.unlock(depositBalance)}
          />
        );
      case undefined:
        return (
          <BalancesSection
            onConvert={startMigration}
            onUnwrap={startUnwrap}
            onUnlock={startUnlock}
            onMoveToWrapped={startMoveToWrapped}
          />
        );
    }
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
        <Content>
          <Blur isBlurred={!hasContracts}>
            {!currentTransaction
              ? renderContent()
              : <TransactionStatus
                onClose={() => closeTransactionModal()}
                transactionToBeExecuted={currentTransaction}
              />
            }
          </Blur>
          <BlurModal
            isVisible={!hasContracts}
            title="Wrong Network"
            body={`You are on an unsupported network (${network}). Please switch to Ethereum Mainnet to migrate your tokens.`}
          />
        </Content>
        <WarningModal
          dataTestId="migration-stopped-warning"
          isVisible={showMigrationStoppedWarning}
          onClose={closeMigrationStoppedWarning}
        >
          <WarningModalContent
            onConfirmClick={closeMigrationStoppedWarning}
            body="Migration is currently stopped. You won't be able to migrate your tokens."
          />
        </WarningModal>
        <WarningModal isVisible={showOtherBalancesWarning} onClose={closeOtherBalancesWarning}>
          <WarningModalContent
            body={`Your GNTb balance will not be converted. Only your GNT balance can be moved to ${tokens.ngnt.ticker}.
            If you want your whole balance migrated, please click on "Cancel this Conversion" and then click "unwrap" and start again.`}
            onConfirmClick={() => {
              closeOtherBalancesWarning();
              continueMigration();
            }}
            onCancelClick={closeOtherBalancesWarning}
          />
        </WarningModal>
      </View>
    </DashboardLayout>
  );
};

const WarningModal = styled(Modal)`
  max-width: 660px;
`;

const View = styled.div`
  max-width: 630px;
  width: 100%;
  padding: 24px 0 0;
  border-top: 1px solid rgb(232, 232, 246);

  @media(max-width: 900px) {
    max-width: initial;
  }
`;

const JazziconWrapper = styled.div`
  margin-right: 24px;
`;

const Content = styled.div`
  position: relative;
`;

interface BlurProps {
  isBlurred: boolean;
}

const Blur = styled.div<BlurProps>`
  filter: ${({isBlurred}) => isBlurred ? 'blur(7px)' : 'none'};
  pointer-events: ${({isBlurred}) => isBlurred ? 'none' : 'initial'};
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
  @media (max-width: 600px) {
    width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @media (max-width: 340px) {
    width: 185px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
