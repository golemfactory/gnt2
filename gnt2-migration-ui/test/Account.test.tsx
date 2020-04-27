import {fireEvent, wait, waitForElement} from '@testing-library/react';
import {getWallets} from 'ethereum-waffle';
import {Services} from '../src/services';
import chai, {expect} from 'chai';
import chaiDom from 'chai-dom';
import {createTestServices} from './helpers/testServices';
import {TransactionDenied} from '../src/errors';
import {advanceEthereumTime} from './helpers/ethereumHelpers';
import chaiAsPromised from 'chai-as-promised';
import {DEPOSIT_LOCK_DELAY} from './helpers/contractConstants';
import {Web3Provider} from 'ethers/providers';
import {TestAccountPage} from './helpers/TestAccountPage';
import {parseEther} from 'ethers/utils';
import {AddressZero} from 'ethers/constants';
import {DEFAULT_TEST_OVERRIDES} from '../../gnt2-contracts/test/utils';
import {GNTMigrationAgentFactory} from 'gnt2-contracts';
import {GNTMigrationAgent} from 'gnt2-contracts/build/contract-types/GNTMigrationAgent';
import {Wallet} from 'ethers';
import sinon from 'sinon';

chai.use(chaiDom);
chai.use(chaiAsPromised);

describe('Account page', () => {

  let services: Services;

  context('with wallet without tokens', async () => {
    beforeEach(async () => {
      ({services} = await createTestServices('empty'));
    });

    it('hide \'GNTB-balance\' field when balance is 0', async () => {
      const accountPage = await new TestAccountPage(services).load();
      await expect(waitForElement(() => accountPage.query('GNTB-balance'), {timeout: 100})).to.be.rejected;
    });

    it('hide \'deposit balance\' and \'deposit timer\' fields when balance is 0', async () => {
      const accountPage = await new TestAccountPage(services).load();
      await expect(waitForElement(() => accountPage.query('deposit-balance'), {timeout: 100})).to.be.rejected;
    });

  });

  context('with wallet with GNT tokens', async () => {
    let provider: Web3Provider;
    let anotherWallet: Wallet;
    let gntMigrationAgent: GNTMigrationAgent;
    let un: () => void;

    beforeEach(async () => {
      ({services, provider} = await createTestServices('holder'));
      ({services} = await createTestServices('holder'));
      const contractAddressService = services.contractAddressService;
      const tokensService = services.tokensService;
      const contractAddresses = contractAddressService.contractAddresses.get();
      anotherWallet = getWallets(provider)[1];
      gntMigrationAgent = GNTMigrationAgentFactory.connect(contractAddresses.migrationAgent, anotherWallet);
      un = tokensService.isMigrationTargetSetToZero.subscribe(sinon.stub());
    });

    afterEach(() => {
      un();
    });

    it('shows info in tooltip & prevent interactions when migration is halted', async () => {
      const accountPage = await new TestAccountPage(services).load();

      await wait(() => {
        expect(accountPage.find('GNT-btn-tooltip')).to.not.have.text('Migration is currently stopped. You won\'t be able to migrate your tokens.');
        expect(accountPage.find('convert-button')).to.not.have.attr('disabled');
      });

      await gntMigrationAgent.setTarget(AddressZero, DEFAULT_TEST_OVERRIDES);

      await wait(() => {
        expect(accountPage.find('GNT-btn-tooltip')).to.have.text('Migration is currently stopped. You won\'t be able to migrate your tokens.');
        expect(accountPage.find('convert-button')).to.have.attr('disabled');
      });

    });

    it('shows and hide modal when migration is halted', async () => {
      const accountPage = await new TestAccountPage(services).load();

      await gntMigrationAgent.setTarget(AddressZero, DEFAULT_TEST_OVERRIDES);
      await wait(() => {
        expect(accountPage.find('migration-stopped-warning')).to.exist;
      });

      const continueBtn = await accountPage.find('modal-button-continue');
      fireEvent.click(continueBtn);
      expect(accountPage.query('migration-stopped-warning')).to.not.exist;
    });

    it('migrates user-specified number of tokens', async () => {
      const accountPage = await new TestAccountPage(services).load();

      await accountPage.migrate('9000.00');
      await accountPage.completeTransaction();

      await wait(() => {
        expect(accountPage.find('NGNT-balance')).to.have.text('9000.0000');
        expect(accountPage.find('GNT-balance')).to.have.text('4991000.0000');
      });
    });

    [
      ['6000000.0', 'number of tokens greater then GNT-balance'],
      ['5000001.0', 'number of tokens greater then GNT-balance'],
    ].forEach(([tokensToMigrate, message]) => {
      it(`shows error for ${message}`, async () => {
        const accountPage = await new TestAccountPage(services).load();

        const input = await accountPage.startMigration();
        fireEvent.change(input, {target: {value: tokensToMigrate}});

        await wait(() => {
          expect(accountPage.find('convert-input-error')).to.exist;
          expect(accountPage.find('convert-button')).to.have.attr('disabled');
        });
      });
    });

    it('shows error for empty value', async () => {
      const accountPage = await new TestAccountPage(services).load();

      const input = await accountPage.startMigration();
      fireEvent.change(input, {target: {value: ''}});
      const convertBtn = await accountPage.find('convert-button');

      fireEvent.click(convertBtn);

      await wait(() => {
        expect(accountPage.find('convert-input-error')).to.exist;
        expect(accountPage.find('convert-button')).to.have.attr('disabled');
      });
    });

    it('sets max number of tokens', async () => {
      const accountPage = await new TestAccountPage(services).load();

      const input = await accountPage.startMigration();

      fireEvent.click(accountPage.find('convert-input-set-max'));

      expect(input).to.have.value('5000000');
    });

    it('disables convert when migrating all tokens', async () => {
      const accountPage = await new TestAccountPage(services).load();

      await accountPage.migrate('5000000');
      await accountPage.completeTransaction();

      await wait(() => {
        expect(accountPage.find('NGNT-balance')).to.have.text('5000000.0000');
        expect(accountPage.find('GNT-balance')).to.have.text('0.0000');
        expect(accountPage.find('convert-button')).to.have.attr('disabled');
      });
    });

    it('shows error in modal when user denied transaction', async () => {
      services.tokensService.migrateTokens = async () => {
        throw new TransactionDenied(new Error());
      };
      const accountPage = await new TestAccountPage(services).load();

      await accountPage.migrate('1000');

      await wait(() => {
        expect(accountPage.find('modal')).to.exist;
        expect(accountPage.find('error-message')).to.exist;
      });
    });

    it('shows modal on migrate', async () => {
      const accountPage = await new TestAccountPage(services).load();

      await accountPage.migrate('2000');

      await wait(() => {
        expect(accountPage.find('modal')).to.exist;
        expect(accountPage.find('etherscan-button')).to.have.trimmed.text('View on etherscan');
        expect(accountPage.find('etherscan-button')).to.have.attr('disabled');
      });
      await accountPage.completeTransaction();
    });

    it('renders successful transaction when one found in local storage', async () => {
      const account = services.connectionService.address.get();
      const contractTransaction = await services.tokensService.migrateTokens(account, parseEther('500'));
      services.transactionService.saveTxHashInLocalStorage({hash: contractTransaction.hash!, description: ''});

      const accountPage = await new TestAccountPage(services).load();

      await accountPage.completeTransaction();

      await wait(() => {
        expect(accountPage.find('NGNT-balance')).to.have.text('500.0000');
        expect(accountPage.find('GNT-balance')).to.have.text('4999500.0000');
      });
    });
  });

  context('with wallet with GNT, GNTB and Deposit', async () => {
    beforeEach(async () => {
      ({services} = await createTestServices('holderUser'));
    });

    it('shows balances', async () => {
      const accountPage = await new TestAccountPage(services).load();

      await wait(() => {
        expect(accountPage.find('ETH-balance')).to.have.text('9999999999999999.9720');
        expect(accountPage.find('GNT-balance')).to.have.text('140000000.0000');
        expect(accountPage.find('NGNT-balance')).to.have.text('0.0000');
        expect(accountPage.find('GNTB-balance')).to.have.text('4999900.0000');
        expect(accountPage.find('deposit')).to.have.text('100.0000');
      });
    });

    it('show warning when trying to migrate', async () => {
      const accountPage = await new TestAccountPage(services).load();
      await wait(() => {
        expect(accountPage.find('GNT-balance')).to.have.text('140000000.0000');
      });

      await accountPage.clickConvert();

      await wait(() => {
        expect(accountPage.find('modal')).to.contain.text('Warning');
      });
    });

    it('can continue migration by acknowledging warning', async () => {
      const accountPage = await new TestAccountPage(services).load();
      await wait(() => {
        expect(accountPage.find('GNT-balance')).to.have.text('140000000.0000');
      });

      await accountPage.clickConvert();
      await accountPage.clickContinueMigration();
      const input = await accountPage.findMigrationInput();
      await accountPage.confirmMigration(input, '5000000');
      await accountPage.completeTransaction();

      await wait(() => {
        expect(accountPage.find('NGNT-balance')).to.have.text('5000000.0000');
        expect(accountPage.find('GNT-balance')).to.have.text('135000000.0000');
      });
    });

  });

  context('wallet with unlocked deposit', async () => {
    beforeEach(async () => {
      let provider: Web3Provider;
      ({services, provider} = await createTestServices());
      const [holderWallet] = getWallets(provider);
      await (await services.tokensService.unlockDeposit(holderWallet.address)).wait();
      await advanceEthereumTime(provider, DEPOSIT_LOCK_DELAY + 1);
    });

    it('refreshes GNTB after tokens moved from Deposit', async () => {
      const accountPage = await new TestAccountPage(services).load();

      await wait(() => {
        expect(accountPage.find('action-deposit-button')).to.have.text('Move to wrapped');
      });

      fireEvent.click(accountPage.find('action-deposit-button'));
      accountPage.confirmUnlock();
      await accountPage.completeTransaction();

      await wait(() => {
        expect(accountPage.query('action-deposit-button')).to.not.exist;
        expect(accountPage.find('GNTB-balance')).to.have.text('5000000.0000');
      });

    });

  });

});
