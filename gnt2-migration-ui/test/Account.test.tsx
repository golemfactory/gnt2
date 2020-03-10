import React from 'react';
import {fireEvent, render, wait, waitForElement} from '@testing-library/react';
import {createMockProvider} from 'ethereum-waffle';
import {Account} from '../src/ui/Account';
import {ServiceContext} from '../src/ui/useServices';
import {Services} from '../src/services';
import chai, {expect} from 'chai';
import chaiDom from 'chai-dom';
import {createTestServices} from './helpers/testServices';
import {TransactionDenied} from '../src/errors';
import {SnackbarProvider} from '../src/ui/Snackbar/SnackbarProvider';

chai.use(chaiDom);

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

  context('wallet without tokens', async () => {
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

  context('wallet with tokens', async () => {
    beforeEach(async () => {
      services = await createTestServices(createMockProvider());
    });

    it('shows balances', async () => {
      const {getByTestId} = renderAccount(services);

      expect(await waitForElement(() => getByTestId('ETH-balance'))).to.have.text('9999999999999999.9721');
      expect(await waitForElement(() => getByTestId('GNT-balance'))).to.have.text('140000000.000');
      expect(await waitForElement(() => getByTestId('NGNT-balance'))).to.have.text('0.000');
      expect(await waitForElement(() => getByTestId('GNTB-balance'))).to.have.text('9999900.000');
      expect(await waitForElement(() => getByTestId('deposit'))).to.have.text('100.000');
    });

    it('shows migrated tokens', async () => {
      const {getByTestId} = await renderAccount(services);
      expect(getByTestId('migrate-button')).to.not.have.attr('disabled');
      fireEvent.click(getByTestId('migrate-button'));

      await wait(() => {
        expect(getByTestId('NGNT-balance')).to.have.text('140000000.000');
        expect(getByTestId('GNT-balance')).to.have.text('0.000');
        expect(getByTestId('migrate-button')).to.have.attr('disabled');
      });
    });

    it('shows modal on migrate', async () => {
      const {getByTestId} = await renderAccount(services);

      fireEvent.click(getByTestId('migrate-button'));

      await wait(() => {
        expect(getByTestId('modal')).to.exist;
        expect(getByTestId('etherscan-button')).to.have.text('View transaction details');
        expect(getByTestId('etherscan-button')).to.not.have.attr('disabled');
        expect(getByTestId('etherscan-link')).to.have.attr('href').match(/https:\/\/rinkeby.etherscan.io\/address\/0x[0-9a-fA-F]{64}/);
      });
    });

    it('shows error in modal with when user denied transaction', async () => {
      services.tokensService.migrateAllTokens = async () => {
        throw new TransactionDenied(new Error());
      };

      const {getByTestId} = await renderAccount(services);

      fireEvent.click(getByTestId('migrate-button'));

      await wait(() => {
        expect(getByTestId('modal')).to.exist;
        expect(getByTestId('error-message')).to.exist;
      });
    });

  });

});
