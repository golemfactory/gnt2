import {expect} from 'chai';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {GolemNetworkTokenFactory} from '../..';

describe('Current GNT token', () => {
  const provider = createMockProvider();
  const [deployer] = getWallets(provider);

  it('deploys correctly', async () => {
    const token = await new GolemNetworkTokenFactory(deployer).deploy(deployer.address, deployer.address, 561345, 7876567);
    expect(await token.name()).to.eq('Golem Network Token');
    expect(await token.symbol()).to.eq('GNT');
    expect(await token.decimals()).to.eq(18);
  });
});
