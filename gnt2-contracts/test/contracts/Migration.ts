import {expect} from 'chai';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {NewGolemNetworkTokenFactory} from '../..';
import {utils, Wallet} from 'ethers';
import {deployOldToken} from '../../src/deployment/deployDevGolemContracts';
import {NOPLogger} from './utils';

async function balance(token, holder: Wallet) {
  return utils.formatUnits(await token.balanceOf(holder.address), 'ether');
}

describe('GNT to NGNT Migration', () => {
  const provider = createMockProvider();
  const [deployWallet, holder] = getWallets(provider);

  it('migrates token', async () => {
    const {token, holderSignedToken} = await deployOldToken(provider, deployWallet, holder, NOPLogger);

    const newToken = await new NewGolemNetworkTokenFactory(deployWallet).deploy();
    await token.setMigrationAgent(newToken.address);

    await holderSignedToken.migrate(utils.parseEther('150000000.0'));

    expect(await balance(token, holder)).to.eq('0.0');
    expect(await balance(newToken, holder)).to.eq('150000000.0');
  });

});
