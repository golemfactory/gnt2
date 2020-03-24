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
import {ConvertTokens} from './Account/ConvertTokens';
import {parseEther} from 'ethers/utils';
import {MoveToWrapped} from './Account/MoveToWrapped';
import {WarningModalContent} from './Account/WarningModalContent';
import {BlurModal} from './BlurModal';
import {DescribeAction} from './Account/AccountActionDescriptions';
import {useAsyncEffect} from './hooks/useAsyncEffect';

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

  const account = useProperty(connectionService.account);
  const network = useProperty(connectionService.network);
  const hasContracts = useProperty(contractAddressService.hasContracts);

  const oldTokensBalance = useProperty(tokensService.gntBalance);
  const gntbBalance = useProperty(tokensService.gntbBalance);
  const depositBalance = useProperty(tokensService.depositBalance);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionWithDescription | undefined>(undefined);
  const [showOtherBalancesWarning, setShowOtherBalancesWarning] = React.useState(false);
  const [startedAction, setStartedAction] = useState<AccountActions | undefined>();

  useAsyncEffect(async () => {
    if (transactionService.isTxStored()) {
      const txFromStore = await transactionService.getTxFromLocalStorage();
      setCurrentTransaction(txFromStore);
    } else {
      setCurrentTransaction(undefined);
    }
  }, [account, network]);


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

  const closeOtherBalancesWarning = () => setShowOtherBalancesWarning(false);

  function migrate(amount: string) {
    setCurrentTransaction({
      txFunction: () => tokensService.migrateTokens(account, parseEther(amount)),
      description: `Migrating ${amount} GNT tokens to NGNT`
    });
  }

  const unwrapTokens = async (amount: string) => {
    setCurrentTransaction({
      txFunction: () => tokensService.unwrap(account, parseEther(amount)),
      description: `Unwrapping ${amount} GNTB tokens to GNT`
    });
  };

  function unlockDeposit() {
    return setCurrentTransaction({txFunction: () => tokensService.unlockDeposit(account), description: 'Unlocking your GNTB deposit'});
  }

  function moveToWrapped() {
    return setCurrentTransaction({
      txFunction: () => tokensService.moveToWrapped(account),
      description: `Withdrawing ${depositBalance} GNTB from your deposit`
    });
  }

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
            {!currentTransaction && startedAction === undefined &&
            <BalancesSection
              onConvert={startMigration}
              onUnwrap={startUnwrap}
              onUnlock={startUnlock}
              onMoveToWrapped={startMoveToWrapped}
            />
            }
            {!currentTransaction && startedAction === AccountActions.MIGRATE && oldTokensBalance &&
            <ConvertTokens
              onCancelClick={stopAction}
              onAmountConfirm={migrate}
              description={DescribeAction.migrate(oldTokensBalance)}
            />
            }
            {!currentTransaction && startedAction === AccountActions.UNWRAP && gntbBalance &&
            <ConvertTokens
              onCancelClick={stopAction}
              onAmountConfirm={unwrapTokens}
              description={DescribeAction.unwrap(gntbBalance)}
            />
            }
            {!currentTransaction && startedAction === AccountActions.WITHDRAW && depositBalance &&
            <MoveToWrapped
              onCancelClick={stopAction}
              onConfirm={moveToWrapped}
              description={DescribeAction.withdraw(depositBalance)}
            />
            }
            {!currentTransaction && startedAction === AccountActions.UNLOCK && depositBalance &&
            <MoveToWrapped
              onCancelClick={stopAction}
              onConfirm={unlockDeposit}
              description={DescribeAction.unlock(depositBalance)}
            />
            }
            {currentTransaction &&
            <TransactionStatus
              onClose={() => closeTransactionModal()}
              transactionToBeExecuted={currentTransaction}
            />
            }
          </Blur>
          <BlurModal isVisible={!hasContracts}/>
        </Content>
        <WarningModal isVisible={showOtherBalancesWarning} onClose={closeOtherBalancesWarning}>
          <WarningModalContent
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
  pointer-events: ${({isBlurred}) => isBlurred ? 'none' : 'initial'}
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
