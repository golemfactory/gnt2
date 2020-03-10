import React from 'react';
import {fireEvent, render, wait, waitForElement} from '@testing-library/react';
import {createMockProvider} from 'ethereum-waffle';
import {ServiceContext} from '../src/ui/hooks/useServices';
import {Services} from '../src/services';
import chai, {expect} from 'chai';
import chaiDom from 'chai-dom';
import {createTestServices} from './helpers/testServices';
import {Web3Provider} from 'ethers/providers';
import {SnackbarProvider} from '../src/ui/Snackbar/SnackbarProvider';
import {BatchingTokensSection} from '../src/ui/BatchingTokensSection';
import {TransactionDenied} from '../src/errors';

chai.use(chaiDom);

async function renderBatching(services: Services) {
  return render(
    <ServiceContext.Provider value={services}>
      <SnackbarProvider>
        <BatchingTokensSection/>
      </SnackbarProvider>
    </ServiceContext.Provider>
  );
}

describe('Batching tokens section UI', () => {

  let services: Services;
  let provider: Web3Provider;

  beforeEach(async () => {
    provider = createMockProvider();
    services = await createTestServices(provider);
  });

  it('hides after unwrap tokens and closes modal', async () => {
    const {getByTestId, queryByTestId} = await renderBatching(services);

    await waitForElement(() => getByTestId('GNTB-balance'));

    const btn = await waitForElement(() => getByTestId('unwrap-tokens-button'));
    fireEvent.click(btn);

    await wait(() => {
      expect(queryByTestId('unwrap-tokens-button')).to.not.exist;
      expect(queryByTestId('GNTB-balance')).to.not.exist;
    });
  });

  it('shows error in modal with when user denied transaction', async () => {
    services.tokensService.unwrap = async () => {
      throw new TransactionDenied(new Error());
    };

    const {getByTestId} = await renderBatching(services);

    const btn = await waitForElement(() => getByTestId('unwrap-tokens-button'));
    fireEvent.click(btn);

    await wait(() => {
      expect(getByTestId('modal')).to.exist;
      expect(getByTestId('error-message')).to.exist;
    });
  });

});
