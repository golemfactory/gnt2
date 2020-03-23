import {JsonRpcProvider, TransactionReceipt} from 'ethers/providers';
import {ContractReceipt} from 'ethers/contract';
import {ConnectionService} from './ConnectionService';
import {TransactionWithDescription} from '../ui/Account';

interface StoredTx {
  hash: string;
  description: string;
}

export class TransactionsService {

  constructor(private provider: () => JsonRpcProvider, private connectionService: ConnectionService) {}

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

  async getTxReceipt(txHash: string): Promise<TransactionReceipt> {
    return this.provider().getTransactionReceipt(txHash);
  }

  async waitForTx(txHash: string, confirmations?: number): Promise<ContractReceipt | undefined> {
    return this.provider().waitForTransaction(txHash, confirmations);
  }

  removeTxFromLocalStorage(): void {
    localStorage.removeItem(this.getKey());
  }

  isTxStored() {
    const storedTxAsString = localStorage.getItem(this.getKey());
    if (storedTxAsString === null) {
      return false;
    }
    const storedTx = JSON.parse(storedTxAsString) as StoredTx;
    return storedTx !== null;
  }

  private getKey() {
    return this.connectionService.network.get() + this.connectionService.account.get().toLowerCase();
  }
}
