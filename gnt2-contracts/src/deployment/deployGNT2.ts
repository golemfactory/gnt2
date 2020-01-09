import {Wallet, providers, ContractFactory} from 'ethers';
import {TransactionOverrides} from '../../build/contract-types';
import {NewGolemNetworkTokenFactory} from '../..';
import {parseUnits} from 'ethers/utils';
import {deployOldToken} from './deployDevGolemContracts';
import {GolemNetworkTokenBatchingFactory} from '../../build/contract-types/GolemNetworkTokenBatchingFactory';
import {GolemNetworkTokenFactory} from '../../build/contract-types/GolemNetworkTokenFactory';

async function start() {
  const provider = new providers.JsonRpcProvider('https://rinkeby.infura.io/v3/e9c991e7745b46908ce2b091a4cf643a');
  const wallet = new Wallet('0xACE228774FDCDD8CEF12E94FE561747C7CD3601C9119AA389ECB43D9909E0BDC', provider);
  console.log(`Deploying contract from address: ${wallet.address}`);
  try{
    const contract = await new NewGolemNetworkTokenFactory(wallet).deploy();
    console.log(`Contract deployed at address: ${contract.address}`);
  } catch (e) {
    console.log(e.message);
  }

}
// start();

async function transferFunds() {
  const provider = new providers.JsonRpcProvider('https://rinkeby.infura.io/v3/e9c991e7745b46908ce2b091a4cf643a');
  const wallet = new Wallet('0xACE228774FDCDD8CEF12E94FE561747C7CD3601C9119AA389ECB43D9909E0BDC', provider);
  const token = NewGolemNetworkTokenFactory.connect('0xef6A0668be10276f6B74eB80593B01B5d0606a2f', wallet);
  await token.migrateFrom(wallet.address, parseUnits('100'))
  // await token.transfer(wallet.address,parseUnits('100'), {gasLimit: 750000});
}
// transferFunds();

async  function deployOld() {
  const provider = new providers.JsonRpcProvider('https://rinkeby.infura.io/v3/e9c991e7745b46908ce2b091a4cf643a');
  const wallet = new Wallet('0xACE228774FDCDD8CEF12E94FE561747C7CD3601C9119AA389ECB43D9909E0BDC', provider);
  const token = await deployOldToken(provider, wallet, wallet);
}
// deployOld();

async function readOldContract() {
  const provider = new providers.JsonRpcProvider('https://rinkeby.infura.io/v3/e9c991e7745b46908ce2b091a4cf643a');
  const wallet = new Wallet('0xACE228774FDCDD8CEF12E94FE561747C7CD3601C9119AA389ECB43D9909E0BDC', provider);
  console.log(await GolemNetworkTokenBatchingFactory.connect('0x123438d379BAbD07134d1d4d7dFa0BCbd56ca3F3', provider).TOKEN());
  const batchingToken = await GolemNetworkTokenBatchingFactory.connect('0x123438d379BAbD07134d1d4d7dFa0BCbd56ca3F3', wallet);
  console.log((await batchingToken.balanceOf(wallet.address)).toString());
  await batchingToken.openGate();
  const gateAddress = await batchingToken.getGateAddress(wallet.address);
  // await batchingToken.transferFrom(gateAddress, wallet.address, parseUnits('100'),{gasLimit: 10001219});
  await batchingToken.withdraw(parseUnits('10'), {gasLimit: 750000});
  await batchingToken.transferFromGate();
  console.log(await batchingToken.balanceOf(wallet.address));

  const token = GolemNetworkTokenFactory.connect('0x924442A66cFd812308791872C4B242440c108E19', provider);
}

readOldContract();
