import React, {useState} from 'react';
import {useAsyncEffect} from './hooks/useAsyncEffect';
import {TransactionProgress} from './TransactionProgress';
import {useServices} from './hooks/useServices';
import {TransactionModal} from './TransactionModal';
import {TransactionWithDescription} from './Account';

interface TransactionModalProps {
  transactionToBeExecuted: TransactionWithDescription;
  onClose: () => void;
}

export const TransactionStatus = ({
  transactionToBeExecuted,
  onClose
}: TransactionModalProps) => {
  const [txInProgress, setTxInProgress] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [transactionHash, setTransactionHash] = React.useState<string | undefined>();
  const {transactionService} = useServices();

  const closeModal = () => {
    onClose();
    setErrorMessage(undefined);
  };

  useAsyncEffect(
    async () => {
      if (!transactionToBeExecuted) {
        return;
      }
      setTxInProgress(true);
      try {
        await transactionService.executeTransaction(transactionToBeExecuted, setTransactionHash);
      } catch (e) {
        setErrorMessage(e.message);
      } finally {
        setTxInProgress(false);
      }
    },
    [transactionToBeExecuted]);

  const closeTxStatus = () => {
    transactionService.removeTxFromLocalStorage();
    closeModal();
  };

  if (!transactionToBeExecuted) {
    return null;
  }

  return (
    <TransactionModal>
      <TransactionProgress
        transactionHash={transactionHash}
        description={transactionToBeExecuted.description}
        errorMessage={errorMessage}
        inProgress={txInProgress}
        onClose={closeTxStatus}
      />
    </TransactionModal>
  );
};
