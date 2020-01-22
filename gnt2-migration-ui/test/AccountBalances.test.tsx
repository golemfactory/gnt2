import React from 'react';
import {fireEvent, render, wait, waitForElement} from '@testing-library/react';
import {createMockProvider} from 'ethereum-waffle';
import {Account} from '../src/ui/Account';
import {ServiceContext} from '../src/ui/useServices';
import {Services} from '../src/services';
import chai, {expect} from 'chai';
import chaiDom from 'chai-dom';
import {createTestServices} from './helpers/testServices';

chai.use(chaiDom);

describe('Account page', () => {

  let services: Services;

  beforeEach(async () => {
    services = await createTestServices(createMockProvider());
  });

  it('shows balances', async () => {
    const {getByTestId} = await render(
      <ServiceContext.Provider value={services}>
        <Account/>
      </ServiceContext.Provider>
    );

    expect(await waitForElement(() => getByTestId('ETH-balance'))).to.have.text('9999999999849999.9914');
    expect(await waitForElement(() => getByTestId('GNT-balance'))).to.have.text('140000000.000');
    expect(await waitForElement(() => getByTestId('NGNT-balance'))).to.have.text('0.000');
    expect(await waitForElement(() => getByTestId('GNTB-balance'))).to.have.text('9999900.000');
    expect(await waitForElement(() => getByTestId('GNTD-balance'))).to.have.text('100.000');
  });

  it('shows migrated tokens', async () => {
    const {queryByTestId, getByTestId} = await render(
      <ServiceContext.Provider value={services}>
        <Account/>
      </ServiceContext.Provider>
    );

    fireEvent.click(getByTestId('button'));

    await wait(() => {
      expect(queryByTestId('NGNT-balance')).to.have.text('140000000.000');
      expect(queryByTestId('GNT-balance')).to.have.text('0.000');
    });
  });
});
