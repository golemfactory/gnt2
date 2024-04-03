import {startGanache} from "./startGanache";
import {MockProvider} from "ethereum-waffle";

const PORT = 8545;

import {factories} from "gnt2-contracts";
import {ethers} from "ethers";

async function start() {
  const chainId = 11155111;

  //do not leak your infura key
  const provider = await ethers.getDefaultProvider("https://sepolia.infura.io/v3/000000000000000000");
  console.log("Ganache started. Chain id: " + (await provider.getNetwork()).chainId);

  //Create wallets by taking defaults from ethereum_waffle and setting ganache as provider
  const wallets = [];

  //do not leak your private key
  wallets.push(new ethers.Wallet("0x0000000000000000000000000000000000000000000000000000000000000000", provider));

  const deployWallet = wallets[0];

  console.log("Deployer: " + deployWallet.address)

  const deployer = deployWallet.address;
  const chainIdFromNetwork = (await provider.getNetwork()).chainId;
  if (chainId != chainIdFromNetwork) {
    throw new Error(`Chain ID mismatch ${chainId} vs ${chainIdFromNetwork}`);
  }
  console.log(`Chain ID: ${chainId}`);

  console.log("Deploying NGNT faucet...");
  const faucet = await new factories.NGNTFaucet__factory(deployWallet).deploy();
  console.log(`NGNT faucet address: ${faucet.address}`);

  //sleep
  await new Promise(r => setTimeout(r, 5000));

  console.log("Deploying New Golem Network Token...");
  const newToken = await new factories.NewGolemNetworkToken__factory(deployWallet).deploy(faucet.address, chainId);
  console.log(`New Golem Network Token address: ${newToken.address}`);

  await new Promise(r => setTimeout(r, 5000));
  console.log("Setting NGNT address in faucet...");
  await factories.NGNTFaucet__factory.connect(faucet.address, deployWallet).setNGNT(newToken.address);
  console.log("NGNT address set.");

  await new Promise(r => setTimeout(r, 5000));
  console.log("Deploying zkSync mock contract...");
  const zkSyncMock = await new factories.ZkSync__factory(deployWallet).deploy();
  console.log(`ZkSync mock contract address: ${zkSyncMock.address}`);

  await new Promise(r => setTimeout(r, 5000));
  console.log(`Deploying MultiTransfer ...`);
  const multiTransfer = await new factories.MultiTransferERC20__factory(deployWallet).deploy(newToken.address);
  console.log(`Multi transfer ERC20 deployed at address: ${multiTransfer.address}`);
 
  await new Promise(r => setTimeout(r, 5000));
  console.log("Deploying LockPayment ...");
  const lockContract = await new factories.LockPayment__factory(deployWallet).deploy(newToken.address);
  console.log(`LockPayment deployed at address: ${lockContract.address}`);
}

start().catch(console.error);
