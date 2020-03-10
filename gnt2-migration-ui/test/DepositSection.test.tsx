import React from 'react';
import {fireEvent, render, wait} from '@testing-library/react';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {ServiceContext} from '../src/ui/useServices';
import {Services} from '../src/services';
import chai, {expect} from 'chai';
import chaiDom from 'chai-dom';
import {createTestServices} from './helpers/testServices';
import {GNTDepositFactory} from '../../gnt2-contracts';
import {GNTDeposit} from 'gnt2-contracts/build/contract-types/GNTDeposit';
import {Web3Provider} from 'ethers/providers';
import {Wallet} from 'ethers';
import {advanceEthereumTime} from './helpers/ethereumHelpers';
import {DepositSection} from '../src/ui/DepositSection';
import {SnackbarProvider} from '../src/ui/Snackbar/SnackbarProvider';

chai.use(chaiDom);

const DEPOSIT_LOCK_DELAY = 48 * 60 * 60;

async function renderDeposit(services: Services) {
  return render(
    <ServiceContext.Provider value={services}>
      <SnackbarProvider>
        <DepositSection/>
      </SnackbarProvider>
    </ServiceContext.Provider>
  );
}

function getGntDepositContract(services: Services, provider: Web3Provider, holder: Wallet) {
  return GNTDepositFactory.connect(services.contractAddressService.contractAddresses.get().gntDeposit, provider.getSigner(holder.address));
}

describe('Deposit UI', () => {

  let services: Services;
  let gntDeposit: GNTDeposit;
  let provider: Web3Provider;
  beforeEach(async () => {
    provider = createMockProvider();
    services = await createTestServices(provider);
    const [holder] = getWallets(provider);
    gntDeposit = getGntDepositContract(services, provider, holder);
  });

  it('shows deposit status when locked', async () => {
    const {getByTestId} = await renderDeposit(services);

    await wait(() => {
      expect(getByTestId('deposit-status')).to.have.text('Deposit is locked');
    });
  });

  it('shows deposit in time locked status', async () => {
    await unlockDeposit();
    const {getByTestId} = await renderDeposit(services);

    await wait(() => {
      expect(getByTestId('deposit-status')).to.have.text('Deposit is time-locked');
      expect(getByTestId('deposit-timer').textContent).to.match(/Time left to unlock deposit: 47:59:\d\d/);
    });
  });

  it('shows deposit as unlocked', async () => {
    await unlockDeposit();
    await advanceEthereumTime(provider, DEPOSIT_LOCK_DELAY);
    const {getByTestId} = await renderDeposit(services);

    await wait(() => {
      expect(getByTestId('deposit-status')).to.have.text('Deposit is unlocked');
    });
  });

  it('unlocks deposit', async () => {
    const {getByTestId} = await renderDeposit(services);

    await wait(() => {
      fireEvent.click(getByTestId('action-deposit-button'));
      expect(getByTestId('action-deposit-button')).to.have.text('Time lock');
      expect(getByTestId('deposit-status')).to.have.text('Deposit is time-locked');
      expect(getByTestId('deposit-timer').textContent).to.match(/Time left to unlock deposit: 47:59:\d\d/);
    });

  });

  async function unlockDeposit() {
    await (await gntDeposit.unlock()).wait();
  }

});
