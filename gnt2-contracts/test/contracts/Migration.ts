import chai, {expect} from 'chai';
import {createMockProvider, getWallets, solidity} from 'ethereum-waffle';
import {NewGolemNetworkTokenFactory} from '../..';
import {ContractFactory, utils, Wallet} from 'ethers';
import {deployOldToken} from '../../src/deployment/deployDevGolemContracts';
import {DEFAULT_TEST_OVERRIDES, NOPLogger} from '../utils';
import {GNTMigrationAgentFactory} from '../../build/contract-types/GNTMigrationAgentFactory';
import {parseEther} from 'ethers/utils';
import chaiAsPromised from 'chai-as-promised';
import {MigrationAgentFactory} from '../../build/contract-types/MigrationAgentFactory';
import {GolemNetworkToken} from '../../build/contract-types/GolemNetworkToken';
import {AddressZero} from 'ethers/constants';

chai.use(chaiAsPromised);
chai.use(solidity);

async function balance(token, holder: Wallet) {
  return utils.formatUnits(await token.balanceOf(holder.address), 'ether');
}

const DEFAULT_CHAIN_ID = 4;


const NON_ZERO_ADDRESS = '0x643231ac6c897df0a822abee6642e6d69df19b2d';
const FIRST_TOKEN_ADDRESS = '0xE742B3951E44bf97C75C90f71621D6C88e38B74F';
const SECOND_TOKEN_ADDRESS = '0xD2cE141C577c80eb67e4549061A8837ac2Bfa020';

describe('GNT Migration Agent', () => {
  const provider = createMockProvider();
  const [deployWallet, holder] = getWallets(provider);

  it('is deployed properly', async () => {
    const {token} = await deployOldToken(provider, deployWallet, holder, NOPLogger);
    const {migrationAgent, newToken} = await deployMigrationAgentWithNewToken(token);

    expect(await migrationAgent.oldToken()).to.eq(token.address);
    expect(await migrationAgent.target()).to.eq(newToken.address);
  });

  it('migrates token', async () => {
    const {token, holderSignedToken} = await deployOldToken(provider, deployWallet, holder, NOPLogger);
    const migrationAgent = await new GNTMigrationAgentFactory(deployWallet).deploy(token.address);
    const newToken = await new NewGolemNetworkTokenFactory(deployWallet).deploy(migrationAgent.address, DEFAULT_CHAIN_ID);
    await migrationAgent.setTarget(newToken.address);
    await token.setMigrationAgent(migrationAgent.address);

    await holderSignedToken.migrate(utils.parseEther('150000000.0'));

    expect(await balance(token, holder)).to.eq('0.0');
    expect(await balance(newToken, holder)).to.eq('150000000.0');
    expect(await migrationAgent.migratedForHolder(holder.address)).to.eq(parseEther('150000000.0'));
  });

  it('cannot migrate when target is not set (when called from old token)', async () => {
    const {token, holderSignedToken} = await deployOldToken(provider, deployWallet, holder, NOPLogger);
    const migrationAgent = await new GNTMigrationAgentFactory(deployWallet).deploy(token.address);
    await token.setMigrationAgent(migrationAgent.address);

    await expect(holderSignedToken.migrate(utils.parseEther('150000000.0'), DEFAULT_TEST_OVERRIDES)).to.be.rejected;
  });

  it('cannot migrate when target is not set', async () => {
    const migrationAgent = await new GNTMigrationAgentFactory(deployWallet).deploy(deployWallet.address);
    await expect(migrationAgent.migrateFrom(holder.address, utils.parseEther('150000000.0'), DEFAULT_TEST_OVERRIDES))
      .to.be.revertedWith('Ngnt/migration-target-not-set');
  });

  it('migration should be possible to be stopped and restarted', async () => {
    const {token, holderSignedToken} = await deployOldToken(provider, deployWallet, holder, NOPLogger);
    const migrationAgent = await new GNTMigrationAgentFactory(deployWallet).deploy(token.address);
    const newToken = await new NewGolemNetworkTokenFactory(deployWallet).deploy(migrationAgent.address, DEFAULT_CHAIN_ID);
    await migrationAgent.setTarget(newToken.address);
    await token.setMigrationAgent(migrationAgent.address);

    await holderSignedToken.migrate(utils.parseEther('1.0'));

    await migrationAgent.setTarget(AddressZero);
    await expect(holderSignedToken.migrate(utils.parseEther('1.0'))).to.be.rejected;

    await migrationAgent.setTarget(newToken.address);
    await holderSignedToken.migrate(utils.parseEther('1.0'));
  });


  it('only token can migrate', async () => {
    const {token} = await deployOldToken(provider, deployWallet, holder, NOPLogger);
    const migrationAgent = await deployMigrationAgent(token);
    const migrationAgentAsHolder = MigrationAgentFactory.connect(migrationAgent.address, holder);

    await expect(migrationAgentAsHolder.migrateFrom(holder.address, parseEther('100'), DEFAULT_TEST_OVERRIDES))
      .to.be.revertedWith('Ngnt/migration-non-token-call');
  });

  it('owner can not migrate', async () => {
    const {token} = await deployOldToken(provider, deployWallet, holder, NOPLogger);
    const migrationAgent = await deployMigrationAgent(token);

    await expect(migrationAgent.migrateFrom(holder.address, parseEther('100'), DEFAULT_TEST_OVERRIDES))
      .to.be.revertedWith('Ngnt/migration-non-token-call');
  });

  it('only owner can set target', async () => {
    const {token} = await deployOldToken(provider, deployWallet, holder, NOPLogger);
    const migrationAgent = await deployMigrationAgent(token);
    const migrationAgentAsHolder = GNTMigrationAgentFactory.connect(migrationAgent.address, holder);

    await expect(migrationAgentAsHolder.setTarget(token.address, DEFAULT_TEST_OVERRIDES)).to.be.reverted;
    await expect(migrationAgent.setTarget(token.address, DEFAULT_TEST_OVERRIDES)).to.be.fulfilled;
  });

  it('old token cannot set target', async () => {
    const migrationAgent = await new GNTMigrationAgentFactory(deployWallet).deploy(holder.address);

    const migrationAgentAsHolder = GNTMigrationAgentFactory.connect(migrationAgent.address, holder);

    await expect(migrationAgentAsHolder.setTarget(AddressZero, DEFAULT_TEST_OVERRIDES)).to.be.reverted;
  });

  it('cannot be deployed with address of old GNT token set to 0', async () => {
    const {interface: abi, bytecode} = new GNTMigrationAgentFactory(deployWallet);
    const factory = new ContractFactory(abi, bytecode, deployWallet);
    await expect(factory.deploy(AddressZero, DEFAULT_TEST_OVERRIDES)).to.be.revertedWith('Ngnt/migration-invalid-old-token');
  });

  it('emits changed target event', async () => {
    const migrationAgent = await new GNTMigrationAgentFactory(deployWallet).deploy(NON_ZERO_ADDRESS);

    await migrationAgent.setTarget(FIRST_TOKEN_ADDRESS);
    await expect(migrationAgent.setTarget(SECOND_TOKEN_ADDRESS))
      .to.emit(migrationAgent, 'TargetChanged').withArgs(FIRST_TOKEN_ADDRESS, SECOND_TOKEN_ADDRESS);
  });

  it('emits migrated event', async () => {
    const {token, holderSignedToken} = await deployOldToken(provider, deployWallet, holder, NOPLogger);
    const {migrationAgent, newToken} = await deployMigrationAgentWithNewToken(token);

    await expect(holderSignedToken.migrate(utils.parseEther('15000')))
      .to.emit(migrationAgent, 'Migrated')
      .withArgs(holder.address, newToken.address, utils.parseEther('15000'));
  });

  async function deployMigrationAgentWithNewToken(token: GolemNetworkToken) {
    const migrationAgent = await new GNTMigrationAgentFactory(deployWallet).deploy(token.address);
    const newToken = await new NewGolemNetworkTokenFactory(deployWallet).deploy(migrationAgent.address, DEFAULT_CHAIN_ID);
    await migrationAgent.setTarget(newToken.address);
    await token.setMigrationAgent(migrationAgent.address);
    return {
      migrationAgent,
      newToken
    };
  }

  async function deployMigrationAgent(token: GolemNetworkToken) {
    const {migrationAgent} = await deployMigrationAgentWithNewToken(token);
    return migrationAgent;
  }

});
