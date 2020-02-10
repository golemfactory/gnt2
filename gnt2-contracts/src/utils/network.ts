import {Provider} from 'ethers/providers';

export async function getChainId(provider: Provider) {
  return (await provider.getNetwork()).chainId;
}
