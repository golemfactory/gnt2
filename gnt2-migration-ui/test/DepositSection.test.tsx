import React from 'react';
import {fireEvent, render, wait, waitForElement} from '@testing-library/react';
import {getWallets} from 'ethereum-waffle';
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
import {DEPOSIT_LOCK_DELAY} from './helpers/contractConstants';
import {TestAccountPage} from './helpers/TestAccountPage';
import {DepositState} from '../src/services/TokensService';
import {BigNumber} from 'ethers/utils';
import sinon from 'sinon';

chai.use(chaiDom);

async function renderDeposit(services: Services) {
  return render(
    <ServiceContext.Provider value={services}>
      <DepositSection onMoveToWrapped={() => { /**/ }} onUnlock={() => { /**/ }}/>
    </ServiceContext.Provider>
  );
}

function getGntDepositContract(services: Services, provider: Web3Provider, holder: Wallet) {
  return GNTDepositFactory.connect(services.contractAddressService.contractAddresses.get().gntDeposit, provider.getSigner(holder.address));
}

describe('Deposit UI', () => {

  let gntDeposit: GNTDeposit;
  let holder: string;
  let services: Services;
  let provider: Web3Provider;

  beforeEach(async () => {
    ({services, provider} = await createTestServices());
    const [holderWallet] = getWallets(provider);
    holder = holderWallet.address;

    gntDeposit = getGntDepositContract(services, provider, holderWallet);
  });

  it('shows deposit status when locked', async () => {
    const {getByTestId} = await renderDeposit(services);

    await wait(() => {
      expect(getByTestId('deposit-status')).to.have.text('Deposit is locked.');
    });
  });

  it('shows deposit in time locked status', async () => {
    await unlockDeposit();
    const {getByTestId} = await renderDeposit(services);

    await wait(() => {
      expect(getByTestId('deposit-status')).to.have.text('Deposit is time-locked.');
      expect(getByTestId('deposit-timer').textContent).to.match(/47:59:\d\d/);
    });
  });

  it('shows deposit in time locked status after click button', async () => {
    const accountPage = await new TestAccountPage(services).load();

    const btn = await waitForElement(() => accountPage.find('action-deposit-button'));
    fireEvent.click(btn);
    await accountPage.confirmUnlock();
    await accountPage.completeTransaction();

    await wait(() => {
      expect(accountPage.find('deposit-status')).to.have.text('Deposit is time-locked.');
      expect(accountPage.find('deposit-timer').textContent).to.match(/47:59:\d\d/);
    });
  });

  it('shows deposit as unlocked', async () => {
    await unlockDeposit();
    await advanceEthereumTime(provider, DEPOSIT_LOCK_DELAY + 1);
    const {getByTestId} = await renderDeposit(services);

    await wait(() => {
      expect(getByTestId('deposit-status')).to.have.text('Deposit is unlocked.');
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

  it('updates status when time is up', async () => {
    sinon.stub(services.tokensService, 'getDepositUnlockTime').resolves(new BigNumber(Date.now()).div(1000).add(3));
    const getDepositStateStub = sinon.stub(services.tokensService, 'getDepositState').resolves(DepositState.TIME_LOCKED);
    const {getByTestId, queryByTestId} = await renderDeposit(services);
    await wait(() => {
      expect(getByTestId('deposit-status')).to.have.text('Deposit is time-locked.');
      expect(getByTestId('deposit-timer').textContent).to.match(/00:00:01/);
    });
    getDepositStateStub.resolves(DepositState.UNLOCKED);
    await wait(() => {
      expect(getByTestId('deposit-status')).to.have.text('Deposit is unlocked.');
      expect(queryByTestId('deposit-timer')).to.not.exist;
    });
  });

  async function unlockDeposit() {
    await (await gntDeposit.unlock()).wait();
  }
});
