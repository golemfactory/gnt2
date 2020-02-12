import {Provider} from 'ethers/providers';

export const NOPLogger = {log: () => { /* do nothing */ }};
export const DEFAULT_TEST_OVERRIDES = {gasLimit: 1000000};

export async function currentTime(provider: Provider) {
  const lastBlock = await provider.getBlock('latest');
  return lastBlock.timestamp;
}
