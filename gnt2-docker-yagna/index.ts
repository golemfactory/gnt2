import { startGanache } from "./startGanache";
import { MockProvider } from "ethereum-waffle";

const PORT = 8545;

import { factories } from "gnt2-contracts";
async function start() {
  const provider = await startGanache(PORT);
  const wallets = new MockProvider().getWallets();
  const deployWallet = wallets[0];
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
  await factories.NGNTFaucet__factory.connect(faucet.address, provider.getSigner(deployer)).setNGNT(newToken.address);
  console.log("NGNT address set.");

  console.log("Deploying zkSync mock contract...");
  const zkSyncMock = await new factories.ZkSync__factory(deployWallet).deploy();
  console.log(`ZkSync mock contract address: ${zkSyncMock.address}`);

  console.log("Supplying wallets with NGNT...");
  for (const wallet of wallets) {
    await factories.NGNTFaucet__factory.connect(faucet.address, provider.getSigner(wallet.address)).create();
  }
  console.log("Wallets supplied.");
}

start().catch(console.error);
