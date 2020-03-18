import React from 'react';
import {fireEvent, render, wait} from '@testing-library/react';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {ServiceContext} from '../src/ui/hooks/useServices';
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
import {DEPOSIT_LOCK_DELAY} from './helpers/contractConstants';

chai.use(chaiDom);

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
  let holder: string;
  beforeEach(async () => {
    provider = createMockProvider();
    services = await createTestServices(provider);
    const [holderWallet] = getWallets(provider);
    holder = holderWallet.address;

    gntDeposit = getGntDepositContract(services, provider, holderWallet);
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
      expect(getByTestId('deposit-timer').textContent).to.match(/47:59:\d\d/);
    });
  });

  it('shows deposit as unlocked', async () => {
    await unlockDeposit();
    await advanceEthereumTime(provider, DEPOSIT_LOCK_DELAY + 1);
    const {getByTestId} = await renderDeposit(services);

    await wait(() => {
      expect(getByTestId('deposit-status')).to.have.text('Deposit is unlocked');
    });
  });


  it('shows "Move to wrapped" when deposit is Unlocked', async () => {
    await (await services.tokensService.unlockDeposit(holder)).wait();
    await advanceEthereumTime(provider, DEPOSIT_LOCK_DELAY + 1);
    const {queryByTestId} = await renderDeposit(services);

    await wait(() => {
      expect(queryByTestId('action-deposit-button')).to.have.text('Move to wrapped');
    });

  });

  it('moves tokens to wrapped', async () => {
    await (await services.tokensService.unlockDeposit(holder)).wait();
    await advanceEthereumTime(provider, DEPOSIT_LOCK_DELAY + 1);
    const {getByTestId, queryByTestId} = await renderDeposit(services);
    await wait(() => {
      expect(queryByTestId('action-deposit-button')).to.have.text('Move to wrapped');
    });

    fireEvent.click(getByTestId('action-deposit-button'));

    await wait(() => {
      expect(queryByTestId('action-deposit-button')).to.be.null;
    });

  });

  async function unlockDeposit() {
    await (await gntDeposit.unlock()).wait();
  }

});
