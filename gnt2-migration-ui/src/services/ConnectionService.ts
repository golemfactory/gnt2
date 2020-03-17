import {JsonRpcProvider, Web3Provider} from 'ethers/providers';
import {State} from 'reactive-properties';
import {NetworkName} from '../config';
import '../types';

export enum ConnectionState {
  UNKNOWN,
  NO_METAMASK,
  NOT_CONNECTED,
  CONNECTED
}

const networkNameFrom = (chainId: string): NetworkName => {
  if (chainId === '4') {
    return 'rinkeby';
  } else {
    return 'local';
  }
};

export class ConnectionService {
  private provider: JsonRpcProvider | undefined;
  network: State<NetworkName>;
  connectionState: ConnectionState;
  account: State<string>;

  constructor(private injectedMetaMaskEthereum: MetamaskEthereum | undefined) {
    this.connectionState = ConnectionState.UNKNOWN;
    this.account = new State<string>('');
    this.network = new State<NetworkName>('local');
  }

  static create() {
    const connectionService = new ConnectionService(window.ethereum);
    connectionService.createProvider();
    return connectionService;
  }

  private createProvider() {
    if (this.injectedMetaMaskEthereum !== undefined && this.injectedMetaMaskEthereum.isMetaMask) {
      this.provider = new Web3Provider(this.injectedMetaMaskEthereum);
      this.metamaskEthereum.on('accountsChanged', (accounts: string[]) => {
        this.handleAccountsChange(accounts);
      });
      this.metamaskEthereum.on('networkChanged', (chainId: string) => {
        this.handleNetworkChange(chainId);
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

  async checkNetwork() {
    this.handleNetworkChange(await this.getProvider().send('net_version', []));
  }

  private handleNetworkChange(chainId: string) {
    this.network.set(networkNameFrom(chainId));
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
