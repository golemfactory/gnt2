import { providers } from "ethers";

export async function getChainId(provider: providers.Provider) {
  return (await provider.getNetwork()).chainId;
}
