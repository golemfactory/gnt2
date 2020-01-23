import {JsonRpcProvider, Web3Provider} from 'ethers/providers';
import {Property, State, withSubscription} from 'reactive-properties';
import {NetworkName} from '../config';
import {Callback, Chain} from '../types/chain';
import '../types';

export enum ConnectionState {
  UNKNOWN,
  NO_METAMASK,
  NOT_CONNECTED,
  CONNECTED
}

const networkNameFrom = (chainId: Chain | string, provider: JsonRpcProvider): NetworkName => {
  let chain;
  if (typeof chainId === 'string') {
    chain = chainId;
  } else {
    chain = chainId.result;
  }
  if (chain === '4') {
    return 'rinkeby';
  } else if (chain === provider.network.chainId.toString()) {
    return 'local';
  }
  throw new Error(`This network is not supported.`);
};

export class ConnectionService {
  private provider: JsonRpcProvider | undefined;
  private networkState: State<NetworkName>;
  network: Property<NetworkName>;
  connectionState: ConnectionState;
  account: State<string>;

  constructor(private injectedMetaMaskEthereum: MetamaskEthereum | undefined) {
    this.connectionState = ConnectionState.UNKNOWN;
    this.account = new State<string>('');
    this.networkState = new State<NetworkName>('local');
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
    if (this.injectedMetaMaskEthereum !== undefined && this.injectedMetaMaskEthereum.isMetaMask) {
      this.provider = new Web3Provider(this.injectedMetaMaskEthereum);
      this.injectedMetaMaskEthereum.on('accountsChanged', (accounts: string[]) => {
        this.handleAccountsChange(accounts);
      });
      this.connectionState = ConnectionState.NOT_CONNECTED;
      return;
    }
    this.connectionState = ConnectionState.NO_METAMASK;
  }

  getProvider() {
    if (this.provider === undefined) {
      throw new Error('Provider requested, but not yet initialized');
    }
    return this.provider;
  }

  async checkConnection() {
    this.handleAccountsChange(await this.getProvider().listAccounts());
  }

  async connect() {
    this.handleAccountsChange(await this.getProvider().send('eth_requestAccounts', []));
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
      this.handleNetworkChange(chainId);
      callback();
    };
    this.metamaskEthereum.on('networkChanged', listener);
    return () => this.metamaskEthereum.off('networkChanged', listener);
  }

  async checkNetwork() {
    this.handleNetworkChange(await this.getProvider().send('net_version', []));
  }

  private handleNetworkChange(chainId: Chain | string) {
    this.networkState.set(networkNameFrom(chainId, this.getProvider()));
  }

  private get metamaskEthereum() {
    if (this.injectedMetaMaskEthereum === undefined) {
      throw new Error('Metamask requested, but not yet initialized');
    }
    return this.injectedMetaMaskEthereum;
  }

  isConnected() {
    return this.connectionState === ConnectionState.CONNECTED;
  }
}
