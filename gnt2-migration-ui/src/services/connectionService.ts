import {AsyncSendable, JsonRpcProvider, Web3Provider} from 'ethers/providers';

export class ConnectionService {
  provider: JsonRpcProvider | undefined;

  constructor(private getGlobalEthereum: () => AsyncSendable | undefined) {
  }

  static create() {
    return new ConnectionService(() => window.ethereum as any);
  }

  async connect() {
    const metamaskProvider = this.getGlobalEthereum();
    if (metamaskProvider !== undefined) {
      const web3Provider = new Web3Provider(metamaskProvider);
      await web3Provider.send('eth_requestAccounts', []);
      this.provider = web3Provider;
      return web3Provider;
    }
    throw new Error('Metamask init failed');
  }

  getProvider() {
    if (this.provider === undefined) {
      throw new Error('Provider requested, but not yet initialized');
    }
    return this.provider;
  }
}
