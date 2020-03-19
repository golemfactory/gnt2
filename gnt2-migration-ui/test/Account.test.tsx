import React from 'react';
import {fireEvent, render, wait, waitForElement} from '@testing-library/react';
import {getWallets} from 'ethereum-waffle';
import {Account} from '../src/ui/Account';
import {ServiceContext} from '../src/ui/hooks/useServices';
import {Services} from '../src/services';
import chai, {expect} from 'chai';
import chaiDom from 'chai-dom';
import {createTestServices} from './helpers/testServices';
import {TransactionDenied} from '../src/errors';
import {SnackbarProvider} from '../src/ui/Snackbar/SnackbarProvider';
import {advanceEthereumTime} from './helpers/ethereumHelpers';
import chaiAsPromised from 'chai-as-promised';
import {DEPOSIT_LOCK_DELAY} from './helpers/contractConstants';
import {Web3Provider} from 'ethers/providers';

chai.use(chaiDom);
chai.use(chaiAsPromised);

function renderAccount(services: Services) {
  return render(
    <ServiceContext.Provider value={services}>
      <SnackbarProvider>
        <Account/>
      </SnackbarProvider>
    </ServiceContext.Provider>
  );
}

class TestAccountPage {
  private getByTestId: any;

  constructor(private services: Services) {
  }

  async load() {
    const {getByTestId} = await renderAccount(this.services);
    this.getByTestId = getByTestId;
    return this;
  }

  async startMigration() {
    await this.clickConvert();
    return this.findMigrationInput();
  }

  async clickConvert() {
    fireEvent.click(await waitForElement(() => this.getByTestId('convert-button')));
  }

  async migrate(amount: string) {
    const input = await this.startMigration();
    this.confirmMigration(input, amount);
  }

  confirmMigration(input: any, amount: string) {
    fireEvent.change(input, {target: {value: amount}});
    fireEvent.click(this.getByTestId('migrate-button'));
  }

  async findMigrationInput() {
    return waitForElement(() => this.getByTestId('migrate-input'));
  }

  async completeMigration() {
    await wait(() => {
      expect(this.getByTestId('modal')).to.contain.text('Transaction complete');
    });
    fireEvent.click(this.getByTestId('modal-close'));
  }

  find(testId: string) {
    return this.getByTestId(testId);
  }

  async clickContinueMigration() {
    fireEvent.click(await waitForElement(() => this.getByTestId('continue-migrate-button')));
  }
}

describe('Account page', () => {

  let services: Services;

  context('with wallet without tokens', async () => {
    beforeEach(async () => {
      ({services} = await createTestServices('empty'));
    });

    it('hide \'GNTB-balance\' field when balance is 0', async () => {
      const {queryByTestId} = renderAccount(services);
      await expect(waitForElement(() => queryByTestId('GNTB-balance'), {timeout: 100})).to.be.rejected;
    });

    it('hide \'deposit balance\' and \'deposit timer\' fields when balance is 0', async () => {
      const {queryByTestId} = renderAccount(services);
      await expect(waitForElement(() => queryByTestId('deposit-balance'), {timeout: 100})).to.be.rejected;
    });

  });

  context('with wallet with GNT tokens', async () => {

    beforeEach(async () => {
      ({services} = await createTestServices('holder'));
    });

    it('migrates user-specified number of tokens', async () => {
      const accountPage = await new TestAccountPage(services).load();

      await accountPage.migrate('9000.00');
      await accountPage.completeMigration();

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
      await accountPage.completeMigration();

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
        expect(accountPage.find('etherscan-button')).to.have.text('View transaction details');
        expect(accountPage.find('etherscan-button')).to.not.have.attr('disabled');
        expect(accountPage.find('etherscan-link')).to.have.attr('href').match(/https:\/\/rinkeby.etherscan.io\/tx\/0x[0-9a-fA-F]{64}/);
      });
    });

    it('shows error in modal when user denied transaction', async () => {
      services.tokensService.migrateTokens = async () => {
        throw new TransactionDenied(new Error());
      };
      const accountPage = await new TestAccountPage(services).load();

      await accountPage.migrate('5000000');

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
      const {getByTestId} = renderAccount(services);

      await wait(() => {
        expect(getByTestId('ETH-balance')).to.have.text('9999999999999999.9720');
        expect(getByTestId('GNT-balance')).to.have.text('140000000.000');
        expect(getByTestId('NGNT-balance')).to.have.text('0.000');
        expect(getByTestId('GNTB-balance')).to.have.text('4999900.000');
        expect(getByTestId('deposit')).to.have.text('100.000');
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
      await accountPage.completeMigration();

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
      const {getByTestId, queryByTestId} = await renderAccount(services);

      await wait(() => {
        expect(queryByTestId('action-deposit-button')).to.have.text('Move to wrapped');
      });

      fireEvent.click(getByTestId('action-deposit-button'));

      await wait(() => {
        expect(queryByTestId('action-deposit-button')).to.not.exist;
        expect(getByTestId('GNTB-balance')).to.have.text('5000000.000');
      });

    });

  });

});
