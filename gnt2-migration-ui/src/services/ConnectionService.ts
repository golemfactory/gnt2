import {JsonRpcProvider, Web3Provider} from 'ethers/providers';
import '../types';
import {Property, State, withSubscription} from 'reactive-properties';

export enum ConnectionState {
  UNKNOWN,
  NO_METAMASK,
  NOT_CONNECTED,
  CONNECTED
}

const selectChain = (chainId: string | undefined): string => {
  if (chainId === '4') {
    return 'Rinkeby';
  } else {
    return 'local';
  }
};

export class ConnectionService {
  private provider: JsonRpcProvider | undefined;
  private networkState: State<string>;
  network: Property<string>;
  connectionState: ConnectionState;
  account: State<string>;

  constructor(private globalEthereum: MetamaskEthereum | undefined) {
    this.connectionState = ConnectionState.UNKNOWN;
    this.account = new State<string>('');
    this.networkState = new State('');
    this.network = this.networkState.pipe(withSubscription(async () => {
      await this.checkNetwork();
    }, this));
  }

  static create() {
    const connectionService = new ConnectionService(window.ethereum);
    connectionService.createProvider();
    return connectionService;
  }

  private createProvider() {
    const metamaskProvider = this.globalEthereum;
    if (metamaskProvider !== undefined && metamaskProvider.isMetaMask) {
      this.provider = new Web3Provider(metamaskProvider);
      metamaskProvider.on('accountsChanged', (accounts: string[]) => {
        this.handleAccountsChange(accounts);
      });
      this.connectionState = ConnectionState.NOT_CONNECTED;
      return;
    }
    this.connectionState = ConnectionState.NO_METAMASK;
  }

  async checkConnection() {
    this.handleAccountsChange(await this.getProvider().listAccounts());
  }

  async connect() {
    this.handleAccountsChange(await this.getProvider().send('eth_requestAccounts', []));
  }

  getProvider() {
    if (this.provider === undefined) {
      throw new Error('Provider requested, but not yet initialized');
    }
    return this.provider;
  }

  private handleAccountsChange(accounts: string[]) {
    if (accounts.length === 0) {
      this.connectionState = ConnectionState.NOT_CONNECTED;
      return;
    }
    this.account.set(accounts[0]);
    this.connectionState = ConnectionState.CONNECTED;
  }

  subscribe(callback: Callback): Callback {
    const listener = (chainId: string) => {
      this.networkState.set(selectChain(chainId));
      callback();
    };
    if (this.globalEthereum === undefined) {
      throw new Error('Metamask requested, but not yet initialized');
    }
    this.globalEthereum.on('networkChanged', listener);
    return () => {
      if (this.globalEthereum === undefined) {
        throw new Error('Metamask requested, but not yet initialized');
      }
      return this.globalEthereum.off('networkChanged', listener);
    };
  }

  async checkNetwork() {
    if (this.globalEthereum === undefined) {
      throw new Error('Metamask requested, but not yet initialized');
    }
    const selectedChain = selectChain(this.globalEthereum.networkVersion);
    await this.networkState.set(selectedChain);
  }
}
