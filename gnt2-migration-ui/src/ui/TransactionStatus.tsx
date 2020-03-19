import React, {useState} from 'react';
import {useAsyncEffect} from './hooks/useAsyncEffect';
import {ContractTransaction} from 'ethers';
import {ContractReceipt} from 'ethers/contract';
import {useSnackbar} from './hooks/useSnackbar';
import {TransactionProgress} from './TransactionProgress';
import {mapCodeToError} from '../utils/mapCodeToError';
import {useServices} from './hooks/useServices';
import {TransactionModal} from './TransactionModal';

interface TransactionModalProps {
  transactionToBeExecuted: (() => Promise<ContractTransaction>) | undefined;
  onClose: () => void;
  description: string;
}

export const TransactionStatus = ({
  transactionToBeExecuted,
  onClose,
  description
}: TransactionModalProps) => {
  const [txInProgress, setTxInProgress] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [currentTx, setCurrentTx] = React.useState<ContractReceipt | undefined>();
  const {show} = useSnackbar();
  const {refreshService} = useServices();

  const closeModal = () => {
    onClose();
    setErrorMessage(undefined);
  };

  async function executeTransaction(transactionToBeExecuted: () => Promise<ContractTransaction>) {
    try {
      const contractTransaction = await transactionToBeExecuted();
      return (contractTransaction).wait();
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
        setCurrentTx(await executeTransaction(transactionToBeExecuted));
        refreshService.refresh();
      } catch (e) {
        show(e.message);
        setErrorMessage(e.message);
      } finally {
        setTxInProgress(false);
      }
    },
    [transactionToBeExecuted]);

  if (!transactionToBeExecuted) {
    return null;
  }

  return (
    <TransactionModal inProgress={txInProgress} errorMessage={errorMessage}>
      <TransactionProgress
        transactionHash={currentTx?.transactionHash}
        description={description}
        errorMessage={errorMessage}
        inProgress={txInProgress}
        onClose={closeModal}

      />
    </TransactionModal>
  );
};
