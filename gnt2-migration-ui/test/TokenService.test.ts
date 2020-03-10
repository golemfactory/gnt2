import {DepositState, TokensService} from '../src/services/TokensService';
import {createMockProvider, getWallets, solidity} from 'ethereum-waffle';
import {deployDevGolemContracts, GolemContractsDeploymentAddresses} from 'gnt2-contracts';
import {utils} from 'ethers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {ContractAddressService} from '../src/services/ContractAddressService';
import {State} from 'reactive-properties';
import {ContractAddresses} from '../src/config';
import {NOPLogger} from '../../gnt2-contracts/test/utils';
import {parseEther} from 'ethers/utils';
import {advanceEthereumTime} from './helpers/ethereumHelpers';
import {DEPOSIT_LOCK_DELAY, TX_HASH_REGEXP} from './helpers/contractConstants';

chai.use(solidity);
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Token Service', () => {
  const provider = createMockProvider();
  const [holderWallet, deployWallet, anotherWallet] = getWallets(provider);
  const holder = holderWallet.address;
  let addresses: GolemContractsDeploymentAddresses;
  let tokensService: TokensService;
  const advanceEthereumTimeBy = (seconds: number) => advanceEthereumTime(provider, seconds);

  beforeEach(async () => {
    addresses = await deployDevGolemContracts(provider, deployWallet, holderWallet, NOPLogger);
    const contractAddressService = {
      contractAddresses: new State<ContractAddresses>(addresses)
    } as unknown as ContractAddressService;
    tokensService = new TokensService(() => provider, contractAddressService);
  });

  it('gets account balance', async () => {
    expect(await tokensService.balanceOfOldTokens(holder)).to.eq(utils.parseEther('140000000.0'));
  });

  describe('migrateTokens', () => {

    it('migrates all tokens and returns transaction hash', async () => {
      const result = await tokensService.migrateAllTokens(holder);
      expect(await tokensService.balanceOfOldTokens(holder)).to.eq(0);
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
      const gntbBalanceBefore = await tokensService.balanceOfBatchingTokens(holder);
      const depositBalanceBefore = await tokensService.balanceOfDeposit(holder);
      await tokensService.unlockDeposit(holder);
      await advanceEthereumTimeBy(DEPOSIT_LOCK_DELAY + 1);

      await tokensService.moveToWrapped(holder);

      expect(await tokensService.getDepositState(holder)).to.equal(DepositState.EMPTY);
      const gntbBalanceAfter = await tokensService.balanceOfBatchingTokens(holder);
      expect(gntbBalanceAfter.sub(gntbBalanceBefore)).to.eq(depositBalanceBefore);
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
