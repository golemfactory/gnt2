import chai, {expect} from 'chai';
import {createMockProvider, getWallets, solidity} from 'ethereum-waffle';
import {NewGolemNetworkTokenFactory} from '../..';
import {utils, Wallet} from 'ethers';
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

describe('GNT Migration Agent', () => {
  const provider = createMockProvider();
  const [deployWallet, holder] = getWallets(provider);

  it('migrates token', async () => {
    const {token, holderSignedToken} = await deployOldToken(provider, deployWallet, holder, NOPLogger);
    const migrationAgent = await new GNTMigrationAgentFactory(deployWallet).deploy(token.address);
    const newToken = await new NewGolemNetworkTokenFactory(deployWallet).deploy(migrationAgent.address, DEFAULT_CHAIN_ID);
    await migrationAgent.setTarget(newToken.address);
    await token.setMigrationAgent(migrationAgent.address);

    await holderSignedToken.migrate(utils.parseEther('150000000.0'));

    expect(await balance(token, holder)).to.eq('0.0');
    expect(await balance(newToken, holder)).to.eq('150000000.0');
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


  it('only token can migrate', async () => {
    const {token} = await deployOldToken(provider, deployWallet, holder, NOPLogger);
    const migrationAgent = await deployMigrationAgent(token);
    const migrationAgentAsHolder = MigrationAgentFactory.connect(migrationAgent.address, holder);

    await expect(migrationAgentAsHolder.migrateFrom(holder.address, parseEther('100'), DEFAULT_TEST_OVERRIDES))
      .to.be.revertedWith('Ngnt/migration-non-token-call');
  });

  it('cannot be deployed with address of old GNT token set to 0', async () => {
    const unsignedTransaction = new GNTMigrationAgentFactory(deployWallet).getDeployTransaction(AddressZero);
    unsignedTransaction.gasLimit = 1000000;
    await expect(provider.sendTransaction(deployWallet.sign(unsignedTransaction))).to.be.revertedWith('Ngnt/migration-invalid-old-token');
  });

  async function deployMigrationAgent(token: GolemNetworkToken) {
    const migrationAgent = await new GNTMigrationAgentFactory(deployWallet).deploy(token.address);
    const newToken = await new NewGolemNetworkTokenFactory(deployWallet).deploy(migrationAgent.address, DEFAULT_CHAIN_ID);
    await migrationAgent.setTarget(newToken.address);
    await token.setMigrationAgent(migrationAgent.address);
    return migrationAgent;
  }

});
