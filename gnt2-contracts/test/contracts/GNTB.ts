import {expect} from 'chai';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {GolemNetworkTokenFactory, GolemNetworkTokenBatchingFactory} from 'gnt2-contracts';

import {deployOldToken, wrapGNTtoGNTB} from '../../src/deployment/deployDevGolemContracts';
import {NOPLogger} from '../utils';

describe('Golem Network Token Batching', () => {
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

  it('wraps GNT tokens as GNTB', async () => {
    const {holderSignedToken: oldToken} = await deployOldToken(provider, deployer, wallet, NOPLogger);
    token = await new GolemNetworkTokenBatchingFactory(wallet).deploy(oldToken.address);
    await wrapGNTtoGNTB(wallet, token, oldToken, '100');
    expect((await token.balanceOf(wallet.address)).toString()).to.eq('100');
  });
});
