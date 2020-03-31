import {DepositState, TokensService} from '../../src/services/TokensService';
import {getWallets, solidity} from 'ethereum-waffle';
import {Wallet} from 'ethers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {parseEther} from 'ethers/utils';
import {advanceEthereumTime} from '../helpers/ethereumHelpers';
import {DEPOSIT_LOCK_DELAY, TX_HASH_REGEXP} from '../helpers/contractConstants';
import {createTestServices} from '../helpers/testServices';
import {Web3Provider} from 'ethers/providers';
import sinon from 'sinon';
import {wrapGNTtoGNTB} from 'gnt2-contracts/src/deployment/deployDevGolemContracts';
import {GNTMigrationAgentFactory, GolemNetworkTokenBatchingFactory, GolemNetworkTokenFactory} from 'gnt2-contracts';
import {wait} from '@testing-library/react';
import {GolemNetworkTokenBatching} from 'gnt2-contracts/build/contract-types/GolemNetworkTokenBatching';
import {GolemNetworkToken} from 'gnt2-contracts/build/contract-types/GolemNetworkToken';
import {Property} from 'reactive-properties';
import {ContractAddressService} from '../../src/services/ContractAddressService';
import {GNTMigrationAgent} from 'gnt2-contracts/build/contract-types/GNTMigrationAgent';
import {DEFAULT_TEST_OVERRIDES} from '../../../gnt2-contracts/test/utils';
import {AddressZero} from 'ethers/constants';
import {PossibleBalance} from '../../src/domain/PossibleBalance';

chai.use(solidity);
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Token Service', () => {
  let provider: Web3Provider;
  let holderWallet: Wallet, anotherWallet: Wallet;
  let holder: string;
  let tokensService: TokensService;
  let gntb: GolemNetworkTokenBatching;
  let gnt: GolemNetworkToken;
  let gntMigrationAgent: GNTMigrationAgent;

  let un1: () => void;
  let un2: () => void;
  let un3: () => void;
  let un4: () => void;

  const advanceEthereumTimeBy = (seconds: number) => advanceEthereumTime(provider, seconds);

  beforeEach(async () => {
    let contractAddressService: ContractAddressService;
    ({services: {contractAddressService, tokensService}, provider} = await createTestServices());
    [holderWallet, anotherWallet] = getWallets(provider);
    holder = holderWallet.address;

    const contractAddresses = contractAddressService.contractAddresses.get();
    gntb = GolemNetworkTokenBatchingFactory.connect(contractAddresses.batchingGolemToken, holderWallet);
    gnt = GolemNetworkTokenFactory.connect(contractAddresses.oldGolemToken, holderWallet);
    gntMigrationAgent = GNTMigrationAgentFactory.connect(contractAddresses.migrationAgent, anotherWallet);
    un1 = tokensService.gntbBalance.subscribe(sinon.stub());
    un2 = tokensService.gntBalance.subscribe(sinon.stub());
    un3 = tokensService.ngntBalance.subscribe(sinon.stub());
    un4 = tokensService.isMigrationTargetSetToZero.subscribe(sinon.stub());
  });

  afterEach(() => {
    un1();
    un2();
    un3();
    un4();
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

  it('refreshes migration target property after change', async () => {
    await wait(() => expect(tokensService.isMigrationTargetSetToZero.get()).to.be.false);
    await gntMigrationAgent.setTarget(AddressZero, DEFAULT_TEST_OVERRIDES);
    await wait(() => expect(tokensService.isMigrationTargetSetToZero.get()).to.be.true);
  });

  it('refreshes GNT and GNTB balances on wrap', async () => {
    await expectBalanceProp(tokensService.gntBalance).to.eqEth('140000000');
    await expectBalanceProp(tokensService.gntbBalance).to.eqEth('4999900');

    await wrapGNTtoGNTB(
      holderWallet,
      gntb,
      gnt,
      parseEther('100').toString()
    );

    await expectBalanceProp(tokensService.gntBalance).to.eqEth('139999900');
    await expectBalanceProp(tokensService.gntbBalance).to.eqEth('5000000');
  });

  it('refreshes GNT balance on GNT Transfer ', async () => {
    await expectBalanceProp(tokensService.gntBalance).to.eqEth('140000000');

    await gnt.transfer(anotherWallet.address, parseEther('10000000'));

    await expectBalanceProp(tokensService.gntBalance).to.eqEth('130000000');
  });

  describe('migrateTokens', () => {

    it('migrate specific number of tokens and return transaction hash', async () => {
      const toMigrate = parseEther('70000000.0');

      const result = await tokensService.migrateTokens(holder, toMigrate);

      await expectBalanceProp(tokensService.ngntBalance).to.eqEth('70000000');
      await expectBalanceProp(tokensService.gntBalance).to.eqEth('70000000');
      expect(result.hash).to.match(TX_HASH_REGEXP);
    });

    [
      ['150000000.0', 'grater then GNT-balance'],
      ['-1000', 'lower then 0'],
      ['0', 'equal to 0']
    ].forEach(([tokensToMigrate, message]) => {
      it(`reverted for number of tokens ${message}`, async () => {
        await expect(tokensService.migrateTokens(holder, parseEther(tokensToMigrate))).to.be.rejected;
      });
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
      await expectBalanceProp(tokensService.gntbBalance).to.eqEth('4999900');
      await tokensService.unlockDeposit(holder);
      await advanceEthereumTimeBy(DEPOSIT_LOCK_DELAY + 1);

      await tokensService.moveToWrapped(holder);

      expect(await tokensService.getDepositState(holder)).to.equal(DepositState.EMPTY);
      await expectBalanceProp(tokensService.gntbBalance).to.eqEth('5000000');
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

      await tokensService.unwrap(holder, gntbBalance);

      const gntBalanceAfter = await tokensService.balanceOfOldTokens(holder);
      expect(gntBalanceAfter.sub(gntBalanceBefore)).to.eq(gntbBalance);
    });

    it('reverted with wrong address', async () => {
      await expect(tokensService.unwrap('0xINVALID', 1)).to.be.rejected;
    });
  });
});
