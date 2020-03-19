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

describe('Account page', () => {

  let services: Services;

  context('with wallet without tokens', async () => {
    beforeEach(async () => {
      ({services} = await createTestServices('empty'));
    });

    it('hide `GNTB-balance` field when balance is 0', async () => {
      const {queryByTestId} = renderAccount(services);
      await expect(waitForElement(() => queryByTestId('GNTB-balance'), {timeout: 100})).to.be.rejected;
    });

    it('hide `deposit balance` and `deposit timer` fields when balance is 0', async () => {
      const {queryByTestId} = renderAccount(services);
      await expect(waitForElement(() => queryByTestId('deposit-balance'), {timeout: 100})).to.be.rejected;
    });

  });

  async function migrate(value = '1000.000', getByTestId: any) {
    const input = await waitForElement(() => getByTestId('migrate-input'));
    fireEvent.change(input, {target: {value: value}});
    fireEvent.click(getByTestId('migrate-button'));
  }

  context('with wallet with GNT tokens', async () => {

    beforeEach(async () => {
      ({services} = await createTestServices('holder'));
    });

    it('migrates user specified number of tokens', async () => {
      const {getByTestId} = await renderAccount(services);

      const input = await waitForElement(() => getByTestId('migrate-input'));
      const tokensToMigrate = '9000.000';
      fireEvent.change(input, {target: {value: tokensToMigrate}});
      expect(input).to.have.value(tokensToMigrate);

      fireEvent.click(getByTestId('migrate-button'));

      await wait(() => {
        expect(getByTestId('NGNT-balance')).to.have.text(tokensToMigrate);
        expect(getByTestId('GNT-balance')).to.have.text('4991000.000');
      });
    });

    [
      ['6000000.0', 'greater then GNT-balance'],
      ['-1000', 'lower then 0'],
      ['0', 'equal to 0']
    ].forEach(([tokensToMigrate, message]) => {
      it(`shows error for number of tokens ${message}`, async () => {
        const {getByTestId} = await renderAccount(services);

        const input = await waitForElement(() => getByTestId('migrate-input'));
        fireEvent.change(input, {target: {value: tokensToMigrate}});
        expect(input).to.have.value(tokensToMigrate);

        fireEvent.click(getByTestId('migrate-button'));

        await wait(() => {
          expect(getByTestId('migrate-error')).to.exist;
        });
        await wait(() => {
          expect(getByTestId('NGNT-balance')).to.have.text('0.000');
          expect(getByTestId('GNT-balance')).to.have.text('5000000.000');
        });
      });
    });

    it('sets max number of tokens', async () => {
      const {getByTestId} = await renderAccount(services);

      const input = await waitForElement(() => getByTestId('migrate-input'));

      fireEvent.click(getByTestId('migrate-btn-set-max'));

      expect(input).to.have.value('5000000');
    });

    it('shows migrated tokens', async () => {
      const {getByTestId} = await renderAccount(services);

      const input = await waitForElement(() => getByTestId('migrate-input'));
      const tokensToMigrate = '5000000.000';
      fireEvent.change(input, {target: {value: tokensToMigrate}});

      fireEvent.click(getByTestId('migrate-button'));

      await wait(() => {
        expect(getByTestId('NGNT-balance')).to.have.text('5000000.000');
        expect(getByTestId('GNT-balance')).to.have.text('0.000');
        expect(getByTestId('migrate-button')).to.have.attr('disabled');
      });
    });

    it('shows modal on migrate', async () => {
      const {getByTestId} = await renderAccount(services);

      const input = await waitForElement(() => getByTestId('migrate-input'));
      const tokensToMigrate = '1000.000';
      fireEvent.change(input, {target: {value: tokensToMigrate}});

      fireEvent.click(getByTestId('migrate-button'));

      await wait(() => {
        expect(getByTestId('modal')).to.exist;
        expect(getByTestId('etherscan-button')).to.have.text('View transaction details');
        expect(getByTestId('etherscan-button')).to.not.have.attr('disabled');
        expect(getByTestId('etherscan-link')).to.have.attr('href').match(/https:\/\/rinkeby.etherscan.io\/tx\/0x[0-9a-fA-F]{64}/);
      });
    });

    it('shows error in modal when user denied transaction', async () => {
      services.tokensService.migrateTokens = async () => {
        throw new TransactionDenied(new Error());
      };
      const {getByTestId} = await renderAccount(services);

      await migrate('1000.000', getByTestId);

      await wait(() => {
        expect(getByTestId('modal')).to.exist;
        expect(getByTestId('error-message')).to.exist;
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
      const {getByTestId} = renderAccount(services);

      await migrate('5000000', getByTestId);

      await wait(() => {
        expect(getByTestId('modal')).to.exist;
        expect(getByTestId('modal')).to.contain.text('Warning');
      });
    });

    it('can continue migration by acknowledging warning', async () => {
      const {getByTestId} = renderAccount(services);
      await wait(() => {
        expect(getByTestId('GNT-balance')).to.have.text('140000000.000');
      });

      await migrate('5000000', getByTestId);
      fireEvent.click(getByTestId('continue-migrate-button'));

      await wait(() => {
        expect(getByTestId('NGNT-balance')).to.have.text('5000000.000');
        expect(getByTestId('GNT-balance')).to.have.text('135000000.000');
        expect(getByTestId('migrate-button')).to.have.attr('disabled');
        expect(getByTestId('modal')).to.not.exist;
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
