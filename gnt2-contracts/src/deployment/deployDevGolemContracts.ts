import { Wallet } from "ethers";
import {
  GNTMigrationAgent__factory,
  GolemNetworkTokenBatching__factory,
  GolemNetworkToken__factory,
  NewGolemNetworkToken__factory
} from "../../build/contract-types/factories";
import { providers } from "ethers";
import { ConsoleLogger, Logger } from "../utils/logger";
import { GolemNetworkTokenBatching } from "../../build/contract-types/GolemNetworkTokenBatching";
import { GolemNetworkToken } from "../../build/contract-types/GolemNetworkToken";
import { GolemContractsDevDeployment } from "./interfaces";
import { utils, BigNumber } from "ethers";
import { getGasLimit } from "../config";
import { getChainId } from "../utils/network";
import { GNTDeposit__factory } from "gnt2-contracts/build/contract-types";

const delay = 48 * 60 * 60;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function mineEmptyBlock(provider: providers.Provider) {
  await (provider as providers.JsonRpcProvider).send("evm_mine", []);
}

async function waitUntilBlock(provider: providers.Provider, blockNumber: number) {
  while ((await provider.getBlockNumber()) < blockNumber) {
    if ((await provider.getNetwork()).name === "unknown") {
      await mineEmptyBlock(provider);
    } else {
      await sleep(5000);
    }
  }
}

function defaultOverrides() {
  return { gasLimit: getGasLimit() };
}

export async function deployOldToken(provider: providers.Provider, deployWallet: Wallet, holder: Wallet, logger: Logger = new ConsoleLogger()) {
  const currentBlockNumber = await provider.getBlockNumber();
  const fundingStartBlock = currentBlockNumber + 3;
  const fundingEndBlock = currentBlockNumber + 5;
  logger.log(`fundingStartBlock = ${fundingStartBlock}`);
  logger.log(`fundingEndBlock = ${fundingEndBlock}`);
  const token = await new GolemNetworkToken__factory(deployWallet).deploy(deployWallet.address, deployWallet.address, fundingStartBlock, fundingEndBlock);
  await token.deployed();
  logger.log(`Deployed at ${token.address}`);
  const holderSignedToken = await token.connect(holder);
  await holderSignedToken.deployed();
  await waitUntilBlock(provider, fundingStartBlock);
  logger.log("Mining...");
  await (await holderSignedToken.create({ ...defaultOverrides(), value: BigNumber.from("15000000000000000") })).wait();
  await waitUntilBlock(provider, fundingEndBlock);
  logger.log("Finalizing...");
  await (await token.finalize(defaultOverrides())).wait();
  logger.log("Done!");
  return { token, holderSignedToken };
}

export async function wrapGNTtoGNTB(wallet: Wallet, gntb: GolemNetworkTokenBatching, gnt: GolemNetworkToken, value: string) {
  let gateAddress = await gntb.getGateAddress(wallet.address);
  if (gateAddress === "0x0000000000000000000000000000000000000000") {
    const contractTransaction = await gntb.openGate({ gasLimit: 300000 });
    await contractTransaction.wait();
    gateAddress = await gntb.getGateAddress(wallet.address);
  }
  await (await gnt.transfer(gateAddress, value, defaultOverrides())).wait();
  return gntb.transferFromGate({ gasLimit: 100000 });
}

export async function deployDevGolemContracts(
  provider: providers.Provider,
  deployWallet: Wallet,
  holderWallet: Wallet,
  gntOnlyWallet: Wallet,
  logger: Logger = new ConsoleLogger()
): Promise<GolemContractsDevDeployment> {
  logger.log("Deploying Old Golem Network Token...");
  const { token: oldToken, holderSignedToken } = await deployOldToken(provider, deployWallet, holderWallet, logger);
  logger.log(`Old Golem Network Token address: ${oldToken.address}`);

  logger.log(`Transferring GNT to... ${gntOnlyWallet.address}`);
  await holderSignedToken.transfer(gntOnlyWallet.address, utils.parseEther("5000000"));

  logger.log(`Deploying Migration Agent ...`);
  const migrationAgent = await new GNTMigrationAgent__factory(deployWallet).deploy(oldToken.address);
  logger.log(`Migration Agent deployed at address: ${migrationAgent.address}`);

  logger.log("Deploying New Golem Network Token...");
  const newToken = await new NewGolemNetworkToken__factory(deployWallet).deploy(migrationAgent.address, await getChainId(provider));
  logger.log(`New Golem Network Token address: ${newToken.address}`);

  const batchingToken = await new GolemNetworkTokenBatching__factory(holderWallet).deploy(oldToken.address);
  await wrapGNTtoGNTB(holderWallet, batchingToken, holderSignedToken, utils.parseEther("5000000").toString());

  logger.log(`Golem Network Token Batching address: ${batchingToken.address}`);
  const tokenDeposit = await new GNTDeposit__factory(holderWallet).deploy(batchingToken.address, oldToken.address, deployWallet.address, delay);
  await batchingToken.transferAndCall(tokenDeposit.address, utils.parseEther("100"), [], { gasLimit: 100000 });
  logger.log(`Golem Network Token Deposit address: ${tokenDeposit.address}`);
  logger.log("Setting new token as migration agent");
  await oldToken.setMigrationAgent(migrationAgent.address);
  await migrationAgent.setTarget(newToken.address);
  logger.log("Migration agent set");
  logger.log(`Dev account: ${holderWallet.address} - ${holderWallet.privateKey}`);
  return {
    oldGolemToken: oldToken.address,
    newGolemToken: newToken.address,
    batchingGolemToken: batchingToken.address,
    gntDeposit: tokenDeposit.address,
    migrationAgent: migrationAgent.address
  };
}
