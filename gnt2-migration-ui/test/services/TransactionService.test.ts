import {TransactionsService} from '../../src/services/TransactionService';

import {solidity} from 'ethereum-waffle';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import {ContractTransaction} from 'ethers';
import {createTestServices} from '../helpers/testServices';
import {JsonRpcProvider} from 'ethers/providers';
import {Services} from '../../src/services';
import sinon, {SinonSandbox} from 'sinon';
import {TransactionFailedError} from '../../src/errors';
import {NetworkName} from '../../src/domain/Network';

chai.use(solidity);
chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

describe('Transactions Service', () => {
  let txService: TransactionsService;
  let rawTx: ContractTransaction;
  let address: string;
  let provider: JsonRpcProvider;
  let services: Services;

  beforeEach(async () => {
    ({services, provider} = await createTestServices());
    txService = services.transactionService;
    address = services.connectionService.address.get();
    rawTx = await services.tokensService.unlockDeposit(address);
  });

  describe('transaction confirmation height', () => {
    [
      ['mainnet', 12],
      ['ropsten', 12],
      ['rinkeby', 6],
      ['kovan', 12],
      ['local', 1]
    ].forEach(([network, confirmationHeight]) => {
      it(`gets confirmation height for ${network}`, async () => {
        services.connectionService.network.set(network as NetworkName);
        expect(txService['getConfirmationHeight']()).to.eq(confirmationHeight);
      });
    });
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

    it('removes transaction', async () => {
      const txToStore = {hash: rawTx.hash!, description: 'a tx'};
      await txService.saveTxHashInLocalStorage(txToStore);

      txService.removeTxFromLocalStorage();

      expect(await txService.isTxStored()).to.be.false;
    });

  });

  describe('executing transaction', () => {

    let sinonSandbox: SinonSandbox;
    beforeEach(() => {
      sinonSandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sinonSandbox.restore();
    });

    it('executes a successful tx', async () => {
      const setTransactionHash = sinon.stub();
      const receipt = await txService.executeTransaction({txFunction: () => Promise.resolve(rawTx), description: ''}, setTransactionHash);
      expect(setTransactionHash).to.have.been.calledWith(rawTx.hash);
      expect(receipt?.confirmations).to.be.greaterThan(0);
    });

    it('throws on failing tx', async () => {
      sinonSandbox.stub(provider, 'getTransactionReceipt').resolves({status: 0, confirmations: 1, byzantium: true});
      await expect(txService.executeTransaction({txFunction: () => Promise.resolve(rawTx), description: ''}, sinon.stub()))
        .to.be.eventually.rejectedWith(TransactionFailedError);
    });
  });

});
