import {ethers, providers} from 'ethers';
import {AsyncSendable} from 'ethers/providers';

export
class MetamaskProvider extends providers.JsonRpcProvider {
  private provider?: Promise<providers.JsonRpcProvider>;

  private static async _initializeProvider(): Promise<providers.JsonRpcProvider> {
    if (typeof window.ethereum !== 'undefined') {
      const metamaskProvider = window.ethereum as AsyncSendable;
      return new ethers.providers.Web3Provider(metamaskProvider);
    }
    throw new Error('Metamask init failed');
  }

  async initialize() {
    this.provider = MetamaskProvider._initializeProvider();
    return this.provider;
  }

  async getAccount() {
    if (this.provider) {
      return (await (await this.provider).send('eth_requestAccounts', []))[0];
    }
  }

  async balanceOf(address: string) {
    if (this.provider) {
      return (await this.provider).getBalance(address);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async perform(method: string, params: any) {
    if (!this.provider) {
      this.provider = MetamaskProvider._initializeProvider();
    }
    const provider = await this.provider;
    return provider.perform(method, params);
  }
}
