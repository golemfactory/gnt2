import {expect} from 'chai';
import {createMockProvider, deployContract, getWallets} from 'ethereum-waffle';
import NewGolemNetworkToken from '../../build/NewGolemNetworkToken.json';
import {ContractJSON} from 'ethereum-waffle/dist/ContractJSON';

describe('New Golem Network Token', () => {
  const provider = createMockProvider();
  const [sender] = getWallets(provider);
  let token;

  it('is deployed properly', async () => {
    token = await deployContract(sender, NewGolemNetworkToken as unknown as ContractJSON);
    expect(await token.name()).to.eq('New Golem Network Token');
    expect(await token.symbol()).to.eq('NGNT');
    expect(await token.decimals()).to.eq(18);
  });
});
