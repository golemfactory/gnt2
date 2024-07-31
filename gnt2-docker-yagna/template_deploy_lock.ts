import {startGanache} from "./startGanache";
import {MockProvider} from "ethereum-waffle";

const PORT = 8545;

import {factories} from "gnt2-contracts";
import {ethers} from "ethers";

async function start() {
  const chainId = 17000;

  const provider = await ethers.getDefaultProvider("https://ethereum-holesky.publicnode.com");
  console.log("Ganache started. Chain id: " + (await provider.getNetwork()).chainId);


  //Create wallets by taking defaults from ethereum_waffle and setting ganache as provider
  const wallets = [];
  wallets.push(new ethers.Wallet("0x0000000000000000000000000000000000000000000000000000000000000010", provider));

  const deployWallet = wallets[0];

  const deployer = deployWallet.address;
  const chainIdFromNetwork = (await provider.getNetwork()).chainId;
  if (chainId != chainIdFromNetwork) {
    throw new Error(`Chain ID mismatch ${chainId} vs ${chainIdFromNetwork}`);
  }
  console.log(`Chain ID: ${chainId}`);

  console.log(`Deploying MultiTransfer ...`);
  const multiTransfer = await new factories.LockPayment__factory(deployWallet).deploy("0x8888888815bf4DB87e57B609A50f938311EEd068");
  console.log(`Multi transfer ERC20 deployed at address: ${multiTransfer.address}`);

  console.log("Wallets supplied.");
}

start().catch(console.error);
