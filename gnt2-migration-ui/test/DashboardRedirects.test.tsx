import React from 'react';
import {render} from '@testing-library/react';
import {ServiceContext} from '../src/ui/hooks/useServices';
import {Services} from '../src/services';
import sinon from 'sinon';
import chai, {expect} from 'chai';
import chaiDom from 'chai-dom';
import {Dashboard} from '../src/ui/Dashboard';
import {MemoryRouter} from 'react-router-dom';
import {createTestServices} from './helpers/testServices';

chai.use(chaiDom);

describe('Dashboard', () => {
  let services: Services;

  beforeEach(async () => {
    ({services} = await createTestServices());
  });

  it('redirects from Login to Account page when connected to MetaMask', async () => {
    sinon.stub(services.connectionService, 'isConnected').returns(true);

    const {getByText} = await render(
      <MemoryRouter initialEntries={['/']}>
        <ServiceContext.Provider value={services}>
          <Dashboard/>
        </ServiceContext.Provider>
      </MemoryRouter>
    );

    expect(getByText('Address:')).to.exist;

  });

  it('redirects from Account page to Login when not connected to MetaMask', async () => {
    sinon.stub(services.connectionService, 'isConnected').returns(false);

    const {getByText} = await render(
      <MemoryRouter initialEntries={['/account']}>
        <ServiceContext.Provider value={services}>
          <Dashboard/>
        </ServiceContext.Provider>
      </MemoryRouter>
    );

    expect(getByText('WELCOME TO')).to.be.exist;
  });
});
