import {expect} from 'chai';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {
  GolemNetworkTokenFactory,
  NewGolemNetworkTokenFactory
} from '../../src/contractsWrappers';
import {utils, Wallet} from "ethers";

async function balance(token, holder: Wallet) {
  return utils.formatUnits(await token.balanceOf(holder.address), 'ether');
}

describe('GNT to NGNT Migration', () => {
  const provider = createMockProvider();
  const [deployer, holder, golemFactory] = getWallets(provider);
  let token;

  async function mineEmptyBlock() {
    await provider.send('evm_mine', []);
  }

  it('migrates token', async () => {
    const currentBlockNumber = await provider.getBlockNumber();
    token = await new GolemNetworkTokenFactory(deployer).deploy(golemFactory.address, deployer.address, currentBlockNumber + 2, currentBlockNumber + 3);
    const holderSignedToken = await token.connect(holder);
    await holderSignedToken.create({value: utils.parseUnits("150000.0")});
    const tokenBalance = await token.balanceOf(holder.address);
    expect(utils.formatUnits(tokenBalance, 'ether')).to.eq('150000000.0');
    await mineEmptyBlock();
    await token.finalize();

    const newToken = await new NewGolemNetworkTokenFactory(deployer).deploy();
    await token.setMigrationAgent(newToken.address);

    await holderSignedToken.migrate(utils.parseEther('150000000.0'));

    expect(await balance(token, holder)).to.eq('0.0');
    expect(await balance(newToken, holder)).to.eq('150000000.0');
  });

});
