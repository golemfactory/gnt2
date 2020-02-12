import {expect} from 'chai';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {GNTDepositFactory} from 'gnt2-contracts';
import {deployOldToken, wrapGNTtoGNTB} from '../../src/deployment/deployDevGolemContracts';
import {GolemNetworkTokenBatchingFactory} from '../..';
import {NOPLogger} from '../utils';

describe('Golem Network Token Deposit', () => {
  const provider = createMockProvider();
  const [, deployer, wallet] = getWallets(provider);

  it('receives deposit from GNTB', async () => {
    const {holderSignedToken: oldToken} = await deployOldToken(provider, deployer, wallet, NOPLogger);
    const token = await new GolemNetworkTokenBatchingFactory(wallet).deploy(oldToken.address);
    const depositToken = await new GNTDepositFactory(wallet).deploy(token.address, token.address, wallet.address, 24 * 60 * 60);
    await wrapGNTtoGNTB(wallet, token, oldToken, '100');
    await token.transferAndCall(depositToken.address, '100', []);
    expect((await depositToken.balanceOf(wallet.address)).toString()).to.eq('100');
  });
});
