import {DepositState, PossibleBalance, TokensService} from '../src/services/TokensService';
import {createMockProvider, getWallets, solidity} from 'ethereum-waffle';
import {Wallet} from 'ethers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {parseEther} from 'ethers/utils';
import {advanceEthereumTime} from './helpers/ethereumHelpers';
import {DEPOSIT_LOCK_DELAY, TX_HASH_REGEXP} from './helpers/contractConstants';
import {createTestServices} from './helpers/testServices';
import {Web3Provider} from 'ethers/providers';
import sinon from 'sinon';
import {wrapGNTtoGNTB} from '../../gnt2-contracts/src/deployment/deployDevGolemContracts';
import {GolemNetworkTokenBatchingFactory, GolemNetworkTokenFactory} from '../../gnt2-contracts';
import {wait} from '@testing-library/react';
import {GolemNetworkTokenBatching} from 'gnt2-contracts/build/contract-types/GolemNetworkTokenBatching';
import {GolemNetworkToken} from 'gnt2-contracts/build/contract-types/GolemNetworkToken';
import {Property} from 'reactive-properties';

chai.use(solidity);
chai.use(chaiAsPromised);
const expect = chai.expect;
export const flushAllPromises = () => new Promise((resolve) => setImmediate(resolve));

describe('Token Service', () => {
  let provider: Web3Provider;
  let holderWallet: Wallet, anotherWallet: Wallet;
  let holder: string;
  let tokensService: TokensService;
  let gntb: GolemNetworkTokenBatching;
  let gnt: GolemNetworkToken;

  const advanceEthereumTimeBy = (seconds: number) => advanceEthereumTime(provider, seconds);
  beforeEach(async () => {
    provider = createMockProvider();
    [holderWallet, anotherWallet] = getWallets(provider);
    holder = holderWallet.address;
    const services = await createTestServices(provider);
    const contractAddresses = services.contractAddressService.contractAddresses.get();
    gntb = GolemNetworkTokenBatchingFactory.connect(contractAddresses.batchingGolemToken, holderWallet);
    gnt = GolemNetworkTokenFactory.connect(contractAddresses.oldGolemToken, holderWallet);
    tokensService = services.tokensService;
    tokensService.gntbBalance.subscribe(sinon.stub());
    tokensService.gntBalance.subscribe(sinon.stub());
  });

  function expectBalanceProp(balanceProp: Property<PossibleBalance>) {
    return {
      to: {
        eqEth: async (ethBalance: string) => {
          return wait(() => {
            expect(balanceProp.get()).to.eq(parseEther(ethBalance));
          }, {interval: 5});
        }
      }
    };
  }

  it('gets account balance', async () => {
    expect(await tokensService.balanceOfOldTokens(holder)).to.eq(parseEther('140000000'));
  });

  it('refreshes GNT and GNTB balances on wrap', async () => {
    await expectBalanceProp(tokensService.gntBalance).to.eqEth('140000000');
    await expectBalanceProp(tokensService.gntbBalance).to.eqEth('9999900');

    await wrapGNTtoGNTB(
      holderWallet,
      gntb,
      gnt,
      parseEther('100').toString()
    );

    await expectBalanceProp(tokensService.gntBalance).to.eqEth('139999900');
    await expectBalanceProp(tokensService.gntbBalance).to.eqEth('10000000');
  });

  it('refreshes GNT balance on GNT Transfer ', async () => {
    await expectBalanceProp(tokensService.gntBalance).to.eqEth('140000000');

    await gnt.transfer(anotherWallet.address, parseEther('10000000'));

    await expectBalanceProp(tokensService.gntBalance).to.eqEth('130000000');
  });

  describe('migrateTokens', () => {

    it('migrates all tokens and returns transaction hash', async () => {
      const result = await tokensService.migrateAllTokens(holder);
      await expectBalanceProp(tokensService.gntBalance).to.eqEth('0');
      expect(result.hash).to.match(TX_HASH_REGEXP);
    });
  });

  describe('changes deposit state', () => {

    it('"Unlock" changes from "Locked" to "Time locked"', async () => {
      expect(await tokensService.getDepositState(holder)).to.equal(DepositState.LOCKED);
      await tokensService.unlockDeposit(holder);
      expect(await tokensService.getDepositState(holder)).to.equal(DepositState.TIME_LOCKED);
    });

    it('when time passes changes from "Time locked" to "Unlocked"', async () => {
      await tokensService.unlockDeposit(holder);
      expect(await tokensService.getDepositState(holder)).to.equal(DepositState.TIME_LOCKED);

      await advanceEthereumTimeBy(DEPOSIT_LOCK_DELAY + 1);

      expect(await tokensService.getDepositState(holder)).to.equal(DepositState.UNLOCKED);
    });

    it('"Move to wrapped" changes from "Unlocked" to "Empty" and increases GNTB balance', async () => {
      await expectBalanceProp(tokensService.gntbBalance).to.eqEth('9999900');
      await tokensService.unlockDeposit(holder);
      await advanceEthereumTimeBy(DEPOSIT_LOCK_DELAY + 1);

      await tokensService.moveToWrapped(holder);

      expect(await tokensService.getDepositState(holder)).to.equal(DepositState.EMPTY);
      await expectBalanceProp(tokensService.gntbBalance).to.eqEth('10000000');
    });
  });

  describe('getDepositState', () => {

    it('returns state of locked deposit', async () => {
      expect(await tokensService.balanceOfDeposit(holder)).to.equal(parseEther('100'));
      expect(await tokensService.getDepositState(holder)).to.equal(DepositState.LOCKED);
    });

    it('returns state of empty deposit', async () => {
      expect(await tokensService.balanceOfDeposit(anotherWallet.address)).to.equal(parseEther('0'));
      expect(await tokensService.getDepositState(anotherWallet.address)).to.equal(DepositState.EMPTY);
    });

    it('returns state of time-locked deposit', async () => {
      await tokensService.unlockDeposit(holder);
      expect(await tokensService.getDepositState(holder)).to.equal(DepositState.TIME_LOCKED);
    });
  });

  describe('unwrap tokens', () => {

    it('moves GNTB balance to GNT', async () => {
      const gntbBalance = await tokensService.balanceOfBatchingTokens(holder);
      const gntBalanceBefore = await tokensService.balanceOfOldTokens(holder);

      await tokensService.unwrap(holder);

      const gntBalanceAfter = await tokensService.balanceOfOldTokens(holder);
      expect(gntBalanceAfter.sub(gntBalanceBefore)).to.eq(gntbBalance);
    });

    it('reverted with wrong address', async () => {
      await expect(tokensService.unwrap('0xINVALID')).to.be.rejected;
    });
  });
});
