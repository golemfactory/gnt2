import '@testing-library/jest-dom/extend-expect';

import React from 'react';
import {render, waitForElement} from '@testing-library/react';
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

describe('Account page', () => {

  async function createTestServices(provider: JsonRpcProvider) {
    const [deployWallet, holderWallet] = getWallets(provider);
    const accountService = new AccountService(() => provider);
    jest.spyOn(accountService, 'getDefaultAccount').mockResolvedValue(holderWallet.address);
    const {newGolemTokenContractAddress, oldGolemTokenContractAddress} = await deployDevGolemContracts(provider, deployWallet, holderWallet, noOpLogger);
    return {
      tokensService: new TokensService(() => provider, oldGolemTokenContractAddress, newGolemTokenContractAddress),
      accountService: accountService
    } as Services;
  }

  test('shows balances', async () => {
    const {getByTestId} = await render(
      <ServiceContext.Provider value={await createTestServices(createMockProvider())}>
        <Account/>
      </ServiceContext.Provider>
    );

    await expect(waitForElement(() => getByTestId('ETH-balance'))).resolves.toHaveTextContent('9999999999849999999869462000000000');
    await expect(waitForElement(() => getByTestId('GNT-balance'))).resolves.toHaveTextContent('150000000000000000000000000');
    await expect(waitForElement(() => getByTestId('NGNT-balance'))).resolves.toHaveTextContent('0');
  });
});
