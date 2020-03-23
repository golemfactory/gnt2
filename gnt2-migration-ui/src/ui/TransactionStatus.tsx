import React, {useState} from 'react';
import {useAsyncEffect} from './hooks/useAsyncEffect';
import {TransactionProgress} from './TransactionProgress';
import {mapCodeToError} from '../utils/mapCodeToError';
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
  const {refreshService, transactionService} = useServices();

  const closeModal = () => {
    onClose();
    setErrorMessage(undefined);
  };

  async function executeTransaction(transactionToBeExecuted: TransactionWithDescription) {
    try {
      const contractTransaction = await transactionToBeExecuted.txFunction();
      const hash = contractTransaction.hash;
      setTransactionHash(hash);
      if (hash) {
        transactionService.saveTxHashInLocalStorage({hash, description: transactionToBeExecuted.description});
        return transactionService.waitForTx(hash);
      }
    } catch (e) {
      throw mapCodeToError(e);
    }
  }

  useAsyncEffect(
    async () => {
      if (!transactionToBeExecuted) {
        return;
      }
      setTxInProgress(true);
      try {
        await executeTransaction(transactionToBeExecuted);
        refreshService.refresh();
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
    <TransactionModal inProgress={txInProgress} errorMessage={errorMessage}>
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
