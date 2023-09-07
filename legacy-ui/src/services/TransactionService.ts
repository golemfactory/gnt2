import {JsonRpcProvider} from 'ethers/providers';
import {ContractReceipt} from 'ethers/contract';
import {ConnectionService} from './ConnectionService';
import {TransactionWithDescription} from '../ui/Account';
import {mapCodeToError} from '../utils/mapCodeToError';
import {TransactionFailedError} from '../errors';
import {ConfirmationHeights} from '../domain/ConfirmationHeights';

interface StoredTx {
  hash: string;
  description: string;
}

export class TransactionsService {

  constructor(private provider: () => JsonRpcProvider, private connectionService: ConnectionService, private confirmationHeights: ConfirmationHeights) {}

  isTxStored() {
    const storedTxAsString = localStorage.getItem(this.getKey());
    if (storedTxAsString === null) {
      return false;
    }
    const storedTx = JSON.parse(storedTxAsString) as StoredTx;
    return storedTx !== null;
  }

  saveTxHashInLocalStorage(storedTx: StoredTx): void {
    localStorage.setItem(this.getKey(), JSON.stringify(storedTx));
  }

  getTxFromLocalStorage(): TransactionWithDescription {
    const storedTxAsString = localStorage.getItem(this.getKey());
    if (!storedTxAsString) {
      throw new Error('No tx stored');
    }
    const storedTx = JSON.parse(storedTxAsString) as StoredTx;
    return {txFunction: () => this.provider().getTransaction(storedTx.hash), description: storedTx.description};
  }

  removeTxFromLocalStorage(): void {
    localStorage.removeItem(this.getKey());
  }

  async executeTransaction(transactionToBeExecuted: TransactionWithDescription, setTransactionHash: (txHash: string | undefined) => void) {
    let receipt: ContractReceipt | undefined;
    try {
      const contractTransaction = await transactionToBeExecuted.txFunction();
      const txHash = contractTransaction.hash;
      setTransactionHash(txHash);
      if (txHash) {
        this.saveTxHashInLocalStorage({hash: txHash, description: transactionToBeExecuted.description});
        receipt = await this.waitForTx(txHash, this.getConfirmationHeight());
      }
    } catch (e) {
      throw mapCodeToError(e);
    }
    if (TransactionsService.isFailed(receipt)) {
      throw new TransactionFailedError();
    }
    return receipt;
  }

  private getConfirmationHeight() {
    const networkName = this.connectionService.network.get();
    if (!networkName) {
      return 1;
    }
    if (this.confirmationHeights[networkName]) {
      return this.confirmationHeights[networkName];
    }
    return this.confirmationHeights.default;
  }

  private async waitForTx(txHash: string, confirmations?: number): Promise<ContractReceipt | undefined> {
    return this.provider().waitForTransaction(txHash, confirmations);
  }

  private getKey() {
    return this.connectionService.network.get() + this.connectionService.address.get().toLowerCase();
  }

  private static isFailed(receipt: ContractReceipt | undefined) {
    return !receipt || !receipt.status ? true : receipt.status !== 1;
  }
}
