import {startGanache} from "./startGanache";
import {MockProvider} from "ethereum-waffle";

const PORT = 8545;

import {factories} from "gnt2-contracts";
import {ethers} from "ethers";

async function start() {
  let chainId: number | undefined = undefined;
  if (!process.env.GANACHE_CHAIN_ID) {
    throw new Error("GANACHE_CHAIN_ID env variable not set or empty");
  }
  chainId = parseInt(process.env.GANACHE_CHAIN_ID);
  if (!chainId) {
    throw new Error("GANACHE_CHAIN_ID should be a number greater than 0");
  }

  const provider = await startGanache(PORT, chainId);
  console.log("Ganache started. Chain id: " + (await provider.getNetwork()).chainId);

  // Create wallets by taking defaults from ethereum_waffle and setting ganache as provider
  const wallets = [];
  for (const wallet of new MockProvider().getWallets()) {
    wallets.push(new ethers.Wallet(wallet.privateKey, provider));
  }
  const deployWallet = wallets[0];
  const deployer = deployWallet.address;
  const chainIdFromNetwork = (await provider.getNetwork()).chainId;
  if (chainId !== chainIdFromNetwork) {
    throw new Error(`Chain ID mismatch ${chainId} vs ${chainIdFromNetwork}`);
  }
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

  console.log(`Deploying MultiTransfer ...`);
  const multiTransfer = await new factories.MultiTransferERC20__factory(deployWallet).deploy(newToken.address);
  console.log(`Multi transfer ERC20 deployed at address: ${multiTransfer.address}`);

  console.log("Deploying LockPayment ...");
  const lockContract = await new factories.LockPayment__factory(deployWallet).deploy(newToken.address);
  console.log(`LockPayment deployed at address: ${lockContract.address}`);

  console.log("Supplying wallets with NGNT...");
  for (const wallet of wallets) {
    await factories.NGNTFaucet__factory.connect(faucet.address, provider.getSigner(wallet.address)).create();
    const balance = await newToken.balanceOf(wallet.address);
    console.log("Account " + wallet.address + " has " + balance.toString() + " NGNT" + " and " + (await wallet.getBalance()).toString() + " ETH");
  }
  console.log("Wallets supplied.");

  console.log("Creating deposit for wallet 1...");
  let tx = await factories.NewGolemNetworkToken__factory.connect(newToken.address, provider.getSigner(wallets[0].address)).approve(lockContract.address, 1000000);

  console.log("Approved LockPayment to transfer NGNT: " + tx);
  let lockPayment = factories.LockPayment__factory.connect(lockContract.address, provider.getSigner(wallets[0].address));
  await lockPayment.createDeposit(1638, wallets[1].address, 100, 10, 0, 0);
  let view = await lockPayment.getMyDeposit(1638);


  console.log("Deposit created:\n  contract address: " + lockPayment.address + "\n  id: " + view.id._hex + "\n  spender: " + view.spender + "\n  funder: " + view.funder + "\n  amount: " + view.amount + "\n  fee: " + view.feeAmount + "\n  expiration: " + view.validTo);

  console.log("Finished successfully!")
}

start().catch(console.error);
