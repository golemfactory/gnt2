import chai, {expect} from 'chai';
import {createMockProvider, getWallets, solidity} from 'ethereum-waffle';
import {NewGolemNetworkTokenFactory} from '../..';
import {
  BigNumberish,
  keccak256,
  parseEther,
  SigningKey,
  solidityKeccak256
} from 'ethers/utils';
import {ethers} from 'ethers';
import {NewGolemNetworkToken} from '../../build/contract-types/NewGolemNetworkToken';
import {DEFAULT_TEST_OVERRIDES} from '../utils';
import {AddressZero} from 'ethers/constants';

chai.use(solidity);

describe('New Golem Network Token', () => {
  const provider = createMockProvider();
  const [deployWallet, minter, holder, spender, thirdWallet] = getWallets(provider);

  it('is deployed properly', async () => {
    const token = await new NewGolemNetworkTokenFactory(deployWallet).deploy(minter.address, 4);

    expect(await token.name()).to.eq('New Golem Network Token');
    expect(await token.symbol()).to.eq('NGNT');
    expect(await token.decimals()).to.eq(18);
  });

  async function mint(token: NewGolemNetworkToken, account: string, amount: BigNumberish) {
    await NewGolemNetworkTokenFactory.connect(token.address, provider.getSigner(minter.address)).mint(account, amount, DEFAULT_TEST_OVERRIDES);
  }

  it('can approve by signature', async () => {
    const token = await deployNGNT();
    const signature = await signPermitDigest(token, holder.address, spender.address, 0, 0, true);
    await token.permit(holder.address, spender.address, 0, 0, true, signature.v!, signature.r, signature.s, DEFAULT_TEST_OVERRIDES);
  });

  it('can spend approved token', async () => {
    const token = await deployNGNT();
    await mint(token, holder.address, parseEther('100'));
    const signature = await signPermitDigest(token, holder.address, spender.address, 0, 0, true);
    await token.permit(holder.address, spender.address, 0, 0, true, signature.v!, signature.r, signature.s, DEFAULT_TEST_OVERRIDES);
    const tokenAsSpender = NewGolemNetworkTokenFactory.connect(token.address, spender);

    await tokenAsSpender.transferFrom(holder.address, thirdWallet.address, parseEther('100'), DEFAULT_TEST_OVERRIDES);

    expect(await token.balanceOf(holder.address)).to.equal(0);
    expect(await token.balanceOf(thirdWallet.address)).to.equal(parseEther('100'));
  });

  it('cannot approve address 0', async () => {
    const token = await deployNGNT();
    const signature = await signPermitDigest(token, AddressZero, spender.address, 0, 0, true);
    await expect(token.permit(AddressZero, spender.address, 0, 0, true, signature.v!, signature.r, signature.s, DEFAULT_TEST_OVERRIDES))
      .to.be.revertedWith('Dai/invalid-address-0');
  });

  async function deployNGNT() {
    return new NewGolemNetworkTokenFactory(deployWallet).deploy(minter.address, 4);
  }

  async function signPermitDigest(
    token: NewGolemNetworkToken,
    holderAddress: string,
    spenderAddress: string,
    nonce: number,
    expiry: number,
    allowed: boolean
  ) {
    const inner = keccak256(ethers.utils.defaultAbiCoder.encode(
      ['bytes32', 'address', 'address', 'uint256', 'uint256', 'bool'],
      [await token.PERMIT_TYPEHASH(), holderAddress, spenderAddress, nonce, expiry, allowed]));
    const message = solidityKeccak256(
      ['bytes2', 'bytes32', 'bytes32'],
      ['0x1901', await token.DOMAIN_SEPARATOR(), inner]
    );
    return new SigningKey(holder.privateKey).signDigest(message);
  }
});
