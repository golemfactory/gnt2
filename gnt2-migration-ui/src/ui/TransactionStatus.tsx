import React, {useState} from 'react';
import {useAsyncEffect} from './hooks/useAsyncEffect';
import {ContractTransaction} from 'ethers';
import {ContractReceipt} from 'ethers/contract';
import {useSnackbar} from './hooks/useSnackbar';
import {TransactionProgress} from './TransactionProgress';
import {Modal} from './Modal';
import {mapCodeToError} from '../utils/mapCodeToError';

interface TransactionModalProps {
  transactionToBeExecuted: (() => Promise<ContractTransaction>) | undefined;
  onClose: () => void;
  refreshTrigger?: () => void;
}

export const TransactionStatus = ({
  transactionToBeExecuted,
  onClose,
  refreshTrigger
}: TransactionModalProps) => {
  const [txInProgress, setTxInProgress] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [currentTx, setCurrentTx] = React.useState<ContractReceipt | undefined>();
  const {show} = useSnackbar();

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
        if (refreshTrigger) {
          refreshTrigger();
        }
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
    <Modal onClose={closeModal} inProgress={txInProgress}>
      <TransactionProgress transactionHash={currentTx?.transactionHash} errorMessage={errorMessage} inProgress={txInProgress}/>
    </Modal>
  );
};
