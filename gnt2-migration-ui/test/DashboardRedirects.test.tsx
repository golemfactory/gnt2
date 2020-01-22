import React from 'react';
import {State} from 'reactive-properties';
import {fireEvent, render, wait, waitForElement} from '@testing-library/react';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {Account} from '../src/ui/Account';
import {ServiceContext} from '../src/ui/useServices';
import {Services} from '../src/services';
import {TokensService} from '../src/services/TokensService';
import {deployDevGolemContracts} from '../../gnt2-contracts';
import {AccountService} from '../src/services/AccountsService';
import {JsonRpcProvider} from 'ethers/providers';
import sinon from 'sinon';
import chai, {expect} from 'chai';
import chaiDom from 'chai-dom';
import {ContractAddressService} from '../src/services/ContractAddressService';
import {ConnectionService} from '../src/services/ConnectionService';
import {Dashboard} from '../src/ui/Dashboard';
import {MemoryRouter} from 'react-router-dom';

chai.use(chaiDom);

describe('Dashboard', () => {
  let services;
  it('redirects to Account page when connected to MetaMask', async () => {

    services = {
      connectionService: {
        isConnected: sinon.stub()
      }
    };

    services.connectionService.isConnected.resolves(true);
    const {queryByText} = await render(
      <MemoryRouter initialEntries={['/']}>
        <ServiceContext.Provider value={services as unknown as Services}>
          <Dashboard/>
        </ServiceContext.Provider>
      </MemoryRouter>
    );

  });
});
