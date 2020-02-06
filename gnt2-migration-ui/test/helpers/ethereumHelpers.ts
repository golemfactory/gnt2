import {Web3Provider} from 'ethers/providers';
import {BigNumber} from 'ethers/utils';

export async function advanceEthereumTime(provider: Web3Provider, seconds: number) {
  await provider.send('evm_increaseTime', [new BigNumber(seconds)]);
  await provider.send('evm_mine', []);
}
