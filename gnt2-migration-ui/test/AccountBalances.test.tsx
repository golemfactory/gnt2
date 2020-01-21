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

chai.use(chaiDom);

const noOpLogger = {
  log: () => {
    /* do nothing */
  }
};

describe('Account page', () => {

  let services: Services;

  function accountServiceWithAddress(provider: JsonRpcProvider, address: string) {
    const accountService = new AccountService(() => provider);
    sinon.stub(accountService, 'getDefaultAccount').resolves(address);
    return accountService;
  }

  async function createTestServices(provider: JsonRpcProvider) {
    const [holderWallet, deployWallet] = getWallets(provider);
    const addresses = await deployDevGolemContracts(provider, deployWallet, holderWallet, noOpLogger);

    function testConnectionService() {
      const connectionService = new ConnectionService(undefined);
      connectionService['provider'] = provider;
      connectionService.checkConnection();
      return connectionService;
    }
    function mockContractAddressService() {
      const connectionService = new ConnectionService({} as MetamaskEthereum);
      connectionService.checkNetwork();

      return {
        golemNetworkTokenAddress: new State({...addresses}),
        golemNetworkTokenAddressState: '',
        getGNTAddress: () => { /* do nothing */ }
      } as unknown as ContractAddressService;
    }

    return {
      tokensService: new TokensService(() => provider, mockContractAddressService()),
      accountService: accountServiceWithAddress(provider, holderWallet.address),
      connectionService: testConnectionService(),
      contractAddressService: mockContractAddressService()
    } as Services;
  }

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
