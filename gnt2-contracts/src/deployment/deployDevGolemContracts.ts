import {utils, Wallet} from 'ethers';
import {GNTDepositFactory, GolemNetworkTokenBatchingFactory, GolemNetworkTokenFactory, NewGolemNetworkTokenFactory} from 'gnt2-contracts';
import {JsonRpcProvider, Provider} from 'ethers/providers';
import {ConsoleLogger, Logger} from '../utils/logger';
import {GolemNetworkTokenBatching} from '../../build/contract-types/GolemNetworkTokenBatching';
import {GolemNetworkToken} from '../../build/contract-types/GolemNetworkToken';
import {GolemContractsDevDeployment} from './interfaces';
import {BigNumber} from 'ethers/utils';
import {getGasLimit} from '../config';

const delay = 48 * 60 * 60;
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function mineEmptyBlock(provider: Provider) {
  await (provider as JsonRpcProvider).send('evm_mine', []);
}

async function waitUntilBlock(provider: Provider, blockNumber: number) {

  while (await provider.getBlockNumber() < blockNumber) {
    if ((await provider.getNetwork()).name !== 'rinkeby') {
      await mineEmptyBlock(provider);
    } else {
      await sleep(5000);
    }
  }
}

function defaultOverrides() {
  return {gasLimit: getGasLimit()};
}

export async function deployOldToken(provider: Provider, deployWallet: Wallet, holder: Wallet, logger: Logger = new ConsoleLogger()) {
  const currentBlockNumber = await provider.getBlockNumber();
  const fundingStartBlock = currentBlockNumber + 3;
  const fundingEndBlock = currentBlockNumber + 5;
  logger.log(`fundingStartBlock = ${fundingStartBlock}`);
  logger.log(`fundingEndBlock = ${fundingEndBlock}`);
  const token = await new GolemNetworkTokenFactory(deployWallet).deploy(
    deployWallet.address,
    deployWallet.address,
    fundingStartBlock,
    fundingEndBlock
  );
  logger.log(`Deployed at ${token.address}`);
  const holderSignedToken = await token.connect(holder);
  await waitUntilBlock(provider, fundingStartBlock);
  logger.log('Mining...');
  await holderSignedToken.create({...defaultOverrides(), value: new BigNumber('15000000000000000')});
  await waitUntilBlock(provider, fundingEndBlock);
  logger.log('Finalizing...');
  await token.finalize(defaultOverrides());
  logger.log('Done!');
  return {token, holderSignedToken};
}

export async function wrapGNTtoGNTB(wallet: Wallet, gntb: GolemNetworkTokenBatching, gnt: GolemNetworkToken, value: string) {
  const contractTransaction = await gntb.openGate({gasLimit: 300000});
  await contractTransaction.wait();
  const gateAddress = await gntb.getGateAddress(wallet.address);
  await (await gnt.transfer(gateAddress, value, defaultOverrides())).wait();
  return gntb.transferFromGate({gasLimit: 100000});
}

export async function deployDevGolemContracts(provider: Provider,
  deployWallet: Wallet,
  holderWallet: Wallet,
  logger: Logger = new ConsoleLogger()
): Promise<GolemContractsDevDeployment> {
  logger.log('Deploying Old Golem Network Token...');
  const {token: oldToken, holderSignedToken} = await deployOldToken(provider, deployWallet, holderWallet, logger);
  logger.log(`Old Golem Network Token address: ${oldToken.address}`);
  logger.log('Deploying New Golem Network Token...');
  const newToken = await new NewGolemNetworkTokenFactory(deployWallet).deploy();
  logger.log(`New Golem Network Token address: ${newToken.address}`);
  const batchingToken = await new GolemNetworkTokenBatchingFactory(holderWallet).deploy(oldToken.address);
  await wrapGNTtoGNTB(holderWallet, batchingToken, holderSignedToken, utils.parseUnits('10000000').toString());
  logger.log(`Golem Network Token Batching address: ${batchingToken.address}`);
  const tokenDeposit = await new GNTDepositFactory(holderWallet)
    .deploy(batchingToken.address, oldToken.address, deployWallet.address, delay);
  await batchingToken.transferAndCall(tokenDeposit.address, utils.parseUnits('100'), [], {gasLimit: 100000});
  logger.log(`Golem Network Token Deposit address: ${tokenDeposit.address}`);
  logger.log('Setting new token as migration agent');
  await oldToken.setMigrationAgent(newToken.address);
  logger.log('Migration agent set');
  logger.log(`Dev account: ${holderWallet.address} - ${holderWallet.privateKey}`);
  return {
    oldGolemToken: oldToken.address,
    newGolemToken: newToken.address,
    batchingGolemToken: batchingToken.address,
    gntDeposit: tokenDeposit.address
  };
}
