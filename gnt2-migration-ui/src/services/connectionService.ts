import {AsyncSendable, JsonRpcProvider, Web3Provider} from 'ethers/providers';

export class ConnectionService {
  private provider: JsonRpcProvider | undefined;
  isInitialized: boolean;

  constructor(private getGlobalEthereum: () => AsyncSendable | undefined) {
    this.isInitialized = false;
  }

  static create() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connectionService = new ConnectionService(() => window.ethereum as any);
    connectionService.createProvider();
    return connectionService;
  }

  createProvider() {
    const metamaskProvider = this.getGlobalEthereum();
    if (metamaskProvider !== undefined) {
      const web3Provider = new Web3Provider(metamaskProvider);
      this.provider = web3Provider;
      return web3Provider;
    }
    throw new Error('Metamask init failed');
  }

  async connect() {
    await this.getProvider().send('eth_requestAccounts', []);
    this.isInitialized = true;
    return this.provider;
  }

  getProvider() {
    if (this.provider === undefined) {
      throw new Error('Provider requested, but not yet initialized');
    }
    return this.provider;
  }
}
