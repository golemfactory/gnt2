import {TransactionsService} from '../../src/services/TransactionService';

import {solidity} from 'ethereum-waffle';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {ContractTransaction} from 'ethers';
import {createTestServices} from '../helpers/testServices';

chai.use(solidity);
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Transactions Service', () => {
  let txService: TransactionsService;
  let rawTx: ContractTransaction;
  let address: string;

  beforeEach(async () => {
    const {services} = await createTestServices();
    txService = services.transactionService;
    address = services.connectionService.account.get();
    rawTx = await services.tokensService.unlockDeposit(address);
  });

  describe('interactions with local storage', () => {

    it('saves and gets transaction', async () => {
      const txToStore = {hash: rawTx.hash!, description: 'a tx'};
      await txService.saveTxHashInLocalStorage(txToStore);

      const storedTx = await txService.getTxFromLocalStorage();

      const contractTransaction = await storedTx.txFunction();
      expect(contractTransaction.hash).to.eq(txToStore.hash);
      expect(storedTx.description).to.eq(txToStore.description);
      expect(await txService.isTxStored()).to.be.true;
    });

    it('returns transaction receipt', async () => {
      const txReceipt = await txService.getTxReceipt(rawTx.hash!);

      expect(txReceipt).to.haveOwnProperty('logs');
    });


    it('removes transaction', async () => {
      const txToStore = {hash: rawTx.hash!, description: 'a tx'};
      await txService.saveTxHashInLocalStorage(txToStore);

      txService.removeTxFromLocalStorage();

      expect(await txService.isTxStored()).to.be.false;
    });

    // it('returns true if stored tx is mined', async () => {
    //   await txService.saveTxHashInLocalStorage(rawTx.hash!);
    //
    //   const isMined = await txService.isStoredTxMined(address);
    //
    //   expect(isMined).to.be.true;
    // });

  });

});
