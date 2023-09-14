import {startGanache} from "./startGanache";
import {MockProvider} from "ethereum-waffle";

const PORT = 8545;

import {factories} from "gnt2-contracts";
import {provider} from "ganache";
import {ethers} from "ethers";

async function start() {
  const provider = await startGanache(PORT);
  const wallets = new MockProvider().getWallets();

  const deployWallet = new ethers.Wallet("0x29f3edee0ad3abf8e2699402e0e28cd6492c9be7eaab00d732a791c33552f797", provider);

  const ganacheWallets = [
    new ethers.Wallet("0x29f3edee0ad3abf8e2699402e0e28cd6492c9be7eaab00d732a791c33552f797", provider),
    new ethers.Wallet("0x5c8b9227cd5065c7e3f6b73826b8b42e198c4497f6688e3085d5ab3a6d520e74", provider),
    new ethers.Wallet("0x50c8b3fc81e908501c8cd0a60911633acaca1a567d1be8e769c5ae7007b34b23", provider),
    new ethers.Wallet("0x706618637b8ca922f6290ce1ecd4c31247e9ab75cf0530a0ac95c0332173d7c5", provider),
    new ethers.Wallet("0xe217d63f0be63e8d127815c7f26531e649204ab9486b134ec1a0ae9b0fee6bcf", provider),
    new ethers.Wallet("0x8101cca52cd2a6d8def002ffa2c606f05e109716522ca2440b2cc84e4d49700b", provider),
    new ethers.Wallet("0x837fd366bc7402b65311de9940de0d6c0ba3125629b8509aebbfb057ebeaaa25", provider),
    new ethers.Wallet("0xba35c32f7cbda6a6cedeea5f73ff928d1e41557eddfd457123f6426a43adb1e4", provider),
    new ethers.Wallet("0x71f7818582e55456cb575eea3d0ce408dcf4cbbc3d845e86a7936d2f48f74035", provider),
    new ethers.Wallet("0x03c909455dcef4e1e981a21ffb14c1c51214906ce19e8e7541921b758221b5ae", provider)
  ]
  const deployer = deployWallet.address;
  const chainId = (await provider.getNetwork()).chainId;
  console.log(`Chain ID: ${chainId}`);

  console.log("Deploying NGNT faucet...");
  const faucet = await new factories.NGNTFaucet__factory(deployWallet).deploy();
  console.log(`NGNT faucet address: ${faucet.address}`);

  console.log("Deploying New Golem Network Token...");
  const newToken = await new factories.NewGolemNetworkToken__factory(deployWallet).deploy(faucet.address, chainId);
  console.log(`New Golem Network Token address: ${newToken.address}`);

  console.log("Setting NGNT address in faucet...");
  await factories.NGNTFaucet__factory.connect(faucet.address, deployWallet).setNGNT(newToken.address);
  console.log("NGNT address set.");

  console.log("Supplying wallets with NGNT...");
  for (const wallet of ganacheWallets) {
    await factories.NGNTFaucet__factory.connect(faucet.address, wallet).create();
    console.log("Dupa nie ma golemów: " + await newToken.balanceOf(wallet.address));
  }
  console.log("Wallets supplied.");
}

start().catch(console.error);
