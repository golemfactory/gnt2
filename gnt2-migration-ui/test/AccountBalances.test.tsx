import '@testing-library/jest-dom/extend-expect';

import React from 'react';
import {render, waitForElement, fireEvent, wait} from '@testing-library/react';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {Account} from '../src/ui/Account';
import {ServiceContext} from '../src/ui/useServices';
import {Services} from '../src/services';
import {TokensService} from '../src/services/TokensService';
import {deployDevGolemContracts} from '../../gnt2-contracts';
import {AccountService} from '../src/services/AccountsService';
import {JsonRpcProvider} from 'ethers/providers';

const noOpLogger = {
  log: () => {
    /* do nothing */
  }
};

const flushAllPromises = () => new Promise((resolve) => setImmediate(resolve));

describe('Account page', () => {

  let services: Services;

  async function createTestServices(provider: JsonRpcProvider) {
    const [holderWallet, deployWallet] = getWallets(provider);
    const accountService = new AccountService(() => provider);
    jest.spyOn(accountService, 'getDefaultAccount').mockResolvedValue(holderWallet.address);
    const {newGolemTokenContractAddress, oldGolemTokenContractAddress} = await deployDevGolemContracts(provider, deployWallet, holderWallet, noOpLogger);
    return {
      tokensService: new TokensService(() => provider, oldGolemTokenContractAddress, newGolemTokenContractAddress),
      accountService: accountService
    } as Services;
  }

  beforeAll(async () => {
    services = await createTestServices(createMockProvider());
  });


  test('shows balances', async () => {
    const {getByTestId} = await render(
      <ServiceContext.Provider value={services}>
        <Account/>
      </ServiceContext.Provider>
    );

    await expect(waitForElement(() => getByTestId('ETH-balance'))).resolves.toHaveTextContent('9999999999849999.9999');
    await expect(waitForElement(() => getByTestId('GNT-balance'))).resolves.toHaveTextContent('150000000.000');
    await expect(waitForElement(() => getByTestId('NGNT-balance'))).resolves.toHaveTextContent('0.0');
  });

  test('shows migrated tokens', async () => {
    const {getByTestId} = await render(
      <ServiceContext.Provider value={services}>
        <Account/>
      </ServiceContext.Provider>
    );

    fireEvent.click(getByTestId('button'));

    await flushAllPromises();

    await expect(waitForElement(() => getByTestId('GNT-balance'))).resolves.toHaveTextContent('0.000');
    await wait(() => expect(waitForElement(() => getByTestId('NGNT-balance'))).resolves.toHaveTextContent('150000000.000'));
  });
});
