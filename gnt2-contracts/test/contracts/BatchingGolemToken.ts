import {expect} from 'chai';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {GolemNetworkTokenFactory} from '../../build/contract-types/GolemNetworkTokenFactory';
import {GolemNetworkTokenBatchingFactory} from '../../build/contract-types/GolemNetworkTokenBatchingFactory';

import {deployOldToken, transferGNTB} from '../../src/deployment/deployDevGolemContracts';

describe('Batching Golem Network Token', () => {
  const provider = createMockProvider();
  const [sender, deployer, wallet] = getWallets(provider);
  let token;

  it('is deployed properly', async () => {
    const oldToken = await new GolemNetworkTokenFactory(deployer).deploy(deployer.address, deployer.address, 561345, 7876567);
    token = await new GolemNetworkTokenBatchingFactory(sender).deploy(oldToken.address);
    expect(await token.name()).to.eq('Golem Network Token Batching');
    expect(await token.symbol()).to.eq('GNTB');
    expect(await token.decimals()).to.eq(18);
  });

  it('adds GNTB tokens to adress', async () => {
    const {holderSignedToken: oldToken} = await deployOldToken(provider, deployer, wallet);
    token = await new GolemNetworkTokenBatchingFactory(wallet).deploy(oldToken.address);
    await transferGNTB(wallet, token, oldToken, '100');
    expect((await token.balanceOf(wallet.address)).toString()).to.eq('100');
  });
});
