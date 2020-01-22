import {utils, Wallet} from 'ethers';
import {NewGolemNetworkTokenFactory, GolemNetworkTokenBatchingFactory, GolemNetworkTokenFactory} from 'gnt2-contracts';
import {JsonRpcProvider, Provider} from 'ethers/providers';
import {ConsoleLogger, Logger} from '../utils/logger';
import {GolemNetworkTokenBatching} from '../../build/contract-types/GolemNetworkTokenBatching';
import {GolemNetworkToken} from '../../build/contract-types/GolemNetworkToken';
import {GolemContractsDevDeployment} from './interfaces';
import {GNTDepositFactory} from '../../build/contract-types/GNTDepositFactory';


async function mineEmptyBlock(provider: Provider) {
  await (provider as JsonRpcProvider).send('evm_mine', []);
}

export async function deployOldToken(provider: Provider, deployWallet: Wallet, holder: Wallet) {
  const currentBlockNumber = await provider.getBlockNumber();
  const token = await new GolemNetworkTokenFactory(deployWallet).deploy(
    deployWallet.address,
    deployWallet.address,
    currentBlockNumber + 2,
    currentBlockNumber + 3
  );
  const holderSignedToken = await token.connect(holder);
  await holderSignedToken.create({value: utils.parseUnits('150000.0')});
  await mineEmptyBlock(provider);
  await token.finalize();
  return {token, holderSignedToken};
}

export async function wrapGNTtoGNTB(wallet: Wallet, gntb: GolemNetworkTokenBatching, gnt: GolemNetworkToken, value: string) {
  await gntb.openGate();
  const gateAddress = await gntb.getGateAddress(wallet.address);
  await gnt.transfer(gateAddress, value);
  await gntb.transferFromGate();
}

export async function deployDevGolemContracts(provider: Provider,
  deployWallet: Wallet,
  holderWallet: Wallet,
  logger: Logger = new ConsoleLogger()
): Promise<GolemContractsDevDeployment> {
  logger.log('Deploying Old Golem Network Token...');
  const {token: oldToken, holderSignedToken} = await deployOldToken(provider, deployWallet, holderWallet);
  logger.log(`Old Golem Network Token address: ${oldToken.address}`);
  logger.log('Deploying New Golem Network Token...');
  const newToken = await new NewGolemNetworkTokenFactory(deployWallet).deploy();
  logger.log(`New Golem Network Token address: ${newToken.address}`);
  const batchingToken = await new GolemNetworkTokenBatchingFactory(holderWallet).deploy(oldToken.address);
  await wrapGNTtoGNTB(holderWallet, batchingToken, holderSignedToken, utils.parseUnits('10000000').toString());
  logger.log(`Golem Network Token Batching address: ${batchingToken.address}`);
  const depositToken = await new GNTDepositFactory(holderWallet)
    .deploy(batchingToken.address, oldToken.address, deployWallet.address, utils.parseEther('1'));
  await batchingToken.transferAndCall(depositToken.address, utils.parseUnits('100').toString(), [], {gasLimit: 100000});
  logger.log(`Golem Network Token Deposit address: ${depositToken.address}`);
  logger.log('Setting new token as migration agent');
  await oldToken.setMigrationAgent(newToken.address);
  logger.log('Migration agent set');
  logger.log(`Dev account: ${holderWallet.address} - ${holderWallet.privateKey}`);
  return {
    oldGolemToken: oldToken.address,
    newGolemToken: newToken.address,
    batchingGolemToken: batchingToken.address,
    depositGolemToken: depositToken.address
  };
}
