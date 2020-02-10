import chai, {expect} from 'chai';
import {createMockProvider, getWallets, solidity} from 'ethereum-waffle';
import {NewGolemNetworkTokenFactory} from '../..';
import {utils, Wallet} from 'ethers';
import {deployOldToken} from '../../src/deployment/deployDevGolemContracts';
import {NOPLogger} from './utils';
import {GNTMigrationAgentFactory} from '../../build/contract-types/GNTMigrationAgentFactory';
import {parseEther} from 'ethers/utils';
import chaiAsPromised from 'chai-as-promised';
import {MigrationAgentFactory} from '../../build/contract-types/MigrationAgentFactory';
import {GolemNetworkToken} from '../../build/contract-types/GolemNetworkToken';
chai.use(chaiAsPromised);
chai.use(solidity);

async function balance(token, holder: Wallet) {
  return utils.formatUnits(await token.balanceOf(holder.address), 'ether');
}

describe('GNT to NGNT Migration', () => {
  const provider = createMockProvider();
  const [deployWallet, holder] = getWallets(provider);

  it('migrates token', async () => {
    const {token, holderSignedToken} = await deployOldToken(provider, deployWallet, holder, NOPLogger);
    const migrationAgent = await new GNTMigrationAgentFactory(deployWallet).deploy(token.address);
    const newToken = await new NewGolemNetworkTokenFactory(deployWallet).deploy(migrationAgent.address);
    await migrationAgent.setTarget(newToken.address);
    await token.setMigrationAgent(migrationAgent.address);

    await holderSignedToken.migrate(utils.parseEther('150000000.0'));

    expect(await balance(token, holder)).to.eq('0.0');
    expect(await balance(newToken, holder)).to.eq('150000000.0');
  });

  it('only token can migrate', async () => {
    const {token} = await deployOldToken(provider, deployWallet, holder, NOPLogger);
    const migrationAgent = await deployMigrationAgent(token);
    const migrationAgentAsHolder = MigrationAgentFactory.connect(migrationAgent.address, holder);

    await expect(migrationAgentAsHolder.migrateFrom(holder.address, parseEther('100'))).to.be.reverted;
  });

  async function deployMigrationAgent(token: GolemNetworkToken) {
    const migrationAgent = await new GNTMigrationAgentFactory(deployWallet).deploy(token.address);
    const newToken = await new NewGolemNetworkTokenFactory(deployWallet).deploy(migrationAgent.address);
    await migrationAgent.setTarget(newToken.address);
    await token.setMigrationAgent(migrationAgent.address);
    return migrationAgent;
  }

});
