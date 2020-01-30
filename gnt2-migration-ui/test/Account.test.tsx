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
import sinon from 'sinon';
import {SnackbarProvider} from '../src/ui/Snackbar/SnackbarProvider';

chai.use(chaiDom);

async function renderAccount(services: Services) {
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

  beforeEach(async () => {
    services = await createTestServices(createMockProvider());
  });

  it('shows balances', async () => {
    const {getByTestId} = await renderAccount(services);

    expect(await waitForElement(() => getByTestId('ETH-balance'))).to.have.text('9999999999999999.9721');
    expect(await waitForElement(() => getByTestId('GNT-balance'))).to.have.text('140000000.000');
    expect(await waitForElement(() => getByTestId('NGNT-balance'))).to.have.text('0.000');
    expect(await waitForElement(() => getByTestId('GNTB-balance'))).to.have.text('9999900.000');
    expect(await waitForElement(() => getByTestId('deposit'))).to.have.text('100.000');
  });

  it('shows migrated tokens', async () => {
    const {getByTestId} = await renderAccount(services);

    fireEvent.click(getByTestId('button'));

    await wait(() => {
      expect(getByTestId('NGNT-balance')).to.have.text('140000000.000');
      expect(getByTestId('GNT-balance')).to.have.text('0.000');
    });
  });

  it('shows modal on migrate', async () => {
    const {getByTestId} = await renderAccount(services);

    fireEvent.click(getByTestId('button'));

    await wait(() => {
      expect(getByTestId('modal')).to.exist;
      expect(getByTestId('etherscan-button')).to.have.text('View transaction details');
      expect(getByTestId('etherscan-button')).to.not.have.attr('disabled');
      expect(getByTestId('etherscan-link')).to.have.attr('href').match(/https:\/\/rinkeby.etherscan.io\/address\/0x[0-9a-fA-F]{64}/);
    });
  });

  it('shows error in modal with when user denied transaction', async () => {
    sinon.stub(services.tokensService, 'migrateAllTokens').rejects(new TransactionDenied(new Error()));
    const {getByTestId} = await renderAccount(services);

    fireEvent.click(getByTestId('button'));

    await wait(() => {
      expect(getByTestId('modal')).to.exist;
      expect(getByTestId('etherscan-button')).to.have.attr('disabled');
      expect(getByTestId('error-message')).to.have.text('User denied transaction signature.');
    });
  });
});
