import React from 'react';
import {fireEvent, render, wait, waitForElement} from '@testing-library/react';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {Account} from '../src/ui/Account';
import {ServiceContext} from '../src/ui/hooks/useServices';
import {Services} from '../src/services';
import chai, {expect} from 'chai';
import chaiDom from 'chai-dom';
import {createTestServices} from './helpers/testServices';
import {TransactionDenied} from '../src/errors';
import {SnackbarProvider} from '../src/ui/Snackbar/SnackbarProvider';
import {advanceEthereumTime} from './helpers/ethereumHelpers';
import {Web3Provider} from 'ethers/providers';
import chaiAsPromised from 'chai-as-promised';
import {DEPOSIT_LOCK_DELAY} from './helpers/contractConstants';

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
      services = await createTestServices(createMockProvider(), true);
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

  context('with wallet with tokens', async () => {
    let provider: Web3Provider;

    beforeEach(async () => {
      provider = createMockProvider();
      services = await createTestServices(provider);
    });

    it('shows balances', async () => {
      const {getByTestId} = renderAccount(services);

      expect(await waitForElement(() => getByTestId('ETH-balance'))).to.have.text('9999999999999999.9721');
      expect(await waitForElement(() => getByTestId('GNT-balance'))).to.have.text('140000000.000');
      expect(await waitForElement(() => getByTestId('NGNT-balance'))).to.have.text('0.000');
      expect(await waitForElement(() => getByTestId('GNTB-balance'))).to.have.text('9999900.000');
      expect(await waitForElement(() => getByTestId('deposit'))).to.have.text('100.000');
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
        expect(getByTestId('GNT-balance')).to.have.text('139991000.000');
      });
    });

    [
      ['150000000.0', 'greater then GNT-balance'],
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
          expect(getByTestId('NGNT-balance')).to.have.text('0.000');
          expect(getByTestId('GNT-balance')).to.have.text('140000000.000');
        });
      });
    });

    it('sets max number of tokens', async () => {
      const {getByTestId} = await renderAccount(services);

      const input = await waitForElement(() => getByTestId('migrate-input'));

      fireEvent.click(getByTestId('migrate-btn-set-max'));

      expect(input).to.have.value('140000000');
    });

    it('shows migrated tokens', async () => {
      const {getByTestId} = await renderAccount(services);

      const input = await waitForElement(() => getByTestId('migrate-input'));
      const tokensToMigrate = '140000000.000';
      fireEvent.change(input, {target: {value: tokensToMigrate}});

      fireEvent.click(getByTestId('migrate-button'));

      await wait(() => {
        expect(getByTestId('NGNT-balance')).to.have.text('140000000.000');
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

      const input = await waitForElement(() => getByTestId('migrate-input'));
      const tokensToMigrate = '1000.000';
      fireEvent.change(input, {target: {value: tokensToMigrate}});

      fireEvent.click(getByTestId('migrate-button'));

      await wait(() => {
        expect(getByTestId('modal')).to.exist;
        expect(getByTestId('error-message')).to.exist;
      });
    });

  });
  context('wallet with unlocked deposit', async () => {
    let provider: Web3Provider;

    beforeEach(async () => {
      provider = createMockProvider();
      services = await createTestServices(provider);
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
        expect(getByTestId('GNTB-balance')).to.have.text('10000000.000');
      });

    });

  });

});
