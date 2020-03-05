import {Web3Provider} from 'ethers/providers';

export async function advanceEthereumTime(provider: Web3Provider, seconds: number) {
  await provider.send('evm_increaseTime', [seconds]);
  await provider.send('evm_mine', []);
}
