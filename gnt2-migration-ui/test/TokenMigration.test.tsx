import '@testing-library/jest-dom/extend-expect';

import React from 'react';
import {render} from '@testing-library/react';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {Account} from '../src/ui/Account';
import {ServiceContext} from '../src/ui/useServices';
import {Services} from '../src/services';
import {TokensService} from '../src/services/TokensService';
import {deployDevGolemContracts} from '../../gnt2-contracts';

describe('Token migration UI with contracts', () => {

  test('migrates token via UI', async () => {
    const provider = createMockProvider();
    const [wallet, holderWallet] = getWallets(provider);
    const {newGolemTokenContractAddress, oldGolemTokenContractAddress} = await deployDevGolemContracts(provider, wallet, holderWallet);
    const services = {
      tokensService: new TokensService(() => provider, oldGolemTokenContractAddress, newGolemTokenContractAddress)
    } as Services;
    const {getByTestId} = render(
      <ServiceContext.Provider value={services}>
        <Account/>
      </ServiceContext.Provider>,
    );

    expect(getByTestId('GNT').textContent).toBe('150000000');
    expect(getByTestId('NGNT').textContent).toBe('0');
  });

});
