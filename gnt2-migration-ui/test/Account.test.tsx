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

    beforeEach(async () => {
      ({services} = await createTestServices('holder'));
    });

    it('migrates user-specified number of tokens', async () => {
      const accountPage = await new TestAccountPage(services).load();

      await accountPage.migrate('9000.00');
      await accountPage.completeTransaction();

      await wait(() => {
        expect(accountPage.find('NGNT-balance')).to.have.text('9000.000');
        expect(accountPage.find('GNT-balance')).to.have.text('4991000.000');
      });
    });

    [
      ['6000000.0', 'number of tokens greater then GNT-balance'],
      ['5000001.0', 'number of tokens greater then GNT-balance'],
      ['-1000', 'number of tokens lower then 0'],
      ['', 'empty value']
    ].forEach(([tokensToMigrate, message]) => {
      it(`shows error for ${message}`, async () => {
        const accountPage = await new TestAccountPage(services).load();

        const input = await accountPage.startMigration();
        fireEvent.change(input, {target: {value: tokensToMigrate}});

        await wait(() => {
          expect(accountPage.find('migrate-error')).to.exist;
          expect(accountPage.find('migrate-button')).to.have.attr('disabled');
        });
      });
    });

    it('sets max number of tokens', async () => {
      const accountPage = await new TestAccountPage(services).load();

      const input = await accountPage.startMigration();

      fireEvent.click(accountPage.find('migrate-btn-set-max'));

      expect(input).to.have.value('5000000');
    });

    it('disables convert when migrating all tokens', async () => {
      const accountPage = await new TestAccountPage(services).load();

      await accountPage.migrate('5000000');
      await accountPage.completeTransaction();

      await wait(() => {
        expect(accountPage.find('NGNT-balance')).to.have.text('5000000.000');
        expect(accountPage.find('GNT-balance')).to.have.text('0.000');
        expect(accountPage.find('convert-button')).to.have.attr('disabled');
      });
    });

    it('shows modal on migrate', async () => {
      const accountPage = await new TestAccountPage(services).load();

      await accountPage.migrate('1000');

      await wait(() => {
        expect(accountPage.find('modal')).to.exist;
        expect(accountPage.find('etherscan-button')).to.have.trimmed.text('View on etherscan');
        expect(accountPage.find('etherscan-button')).to.have.attr('disabled');
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

  });

  context('with wallet with GNT, GNTB and Deposit', async () => {
    beforeEach(async () => {
      ({services} = await createTestServices('holderUser'));
    });

    it('shows balances', async () => {
      const accountPage = await new TestAccountPage(services).load();

      await wait(() => {
        expect(accountPage.find('ETH-balance')).to.have.text('9999999999999999.9720');
        expect(accountPage.find('GNT-balance')).to.have.text('140000000.000');
        expect(accountPage.find('NGNT-balance')).to.have.text('0.000');
        expect(accountPage.find('GNTB-balance')).to.have.text('4999900.000');
        expect(accountPage.find('deposit')).to.have.text('100.000');
      });
    });

    it('show warning when trying to migrate', async () => {
      const accountPage = await new TestAccountPage(services).load();
      await wait(() => {
        expect(accountPage.find('GNT-balance')).to.have.text('140000000.000');
      });

      await accountPage.clickConvert();

      await wait(() => {
        expect(accountPage.find('modal')).to.contain.text('Warning');
      });
    });

    it('can continue migration by acknowledging warning', async () => {
      const accountPage = await new TestAccountPage(services).load();
      await wait(() => {
        expect(accountPage.find('GNT-balance')).to.have.text('140000000.000');
      });

      await accountPage.clickConvert();
      await accountPage.clickContinueMigration();
      const input = await accountPage.findMigrationInput();
      await accountPage.confirmMigration(input, '5000000');
      await accountPage.completeTransaction();

      await wait(() => {
        expect(accountPage.find('NGNT-balance')).to.have.text('5000000.000');
        expect(accountPage.find('GNT-balance')).to.have.text('135000000.000');
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
        expect(accountPage.find('GNTB-balance')).to.have.text('5000000.000');
      });

    });

  });

});
