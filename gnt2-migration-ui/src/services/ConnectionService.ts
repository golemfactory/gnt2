import {JsonRpcProvider, Web3Provider} from 'ethers/providers';
import {combine, Property, State} from 'reactive-properties';
import '../types';
import {NetworkName} from '../domain/Network';
import {Account} from '../domain/Account';

export enum ConnectionState {
  UNKNOWN,
  NO_METAMASK,
  NOT_CONNECTED,
  CONNECTED
}

const networkNameFrom = (chainId: string): NetworkName => {
  switch (chainId) {
    case '1':
      return 'mainnet';
    case '3':
      return 'ropsten';
    case '4':
      return 'rinkeby';
    case '42':
      return 'kovan';
  }
  if (!!Number(chainId) && Number(chainId) > 1000000000) {
    return 'local';
  }
  return 'unknown';
};

export class ConnectionService {
  private provider: JsonRpcProvider | undefined;
  network: State<NetworkName>;
  connectionState: ConnectionState;
  address: State<string>;
  account: Property<Account>;

  constructor(private injectedMetaMaskEthereum: MetamaskEthereum | undefined) {
    this.connectionState = ConnectionState.UNKNOWN;
    this.address = new State<string>('');
    this.network = new State<NetworkName>('local');
    this.account = combine<Account, NetworkName, string>([this.network, this.address], (network, address) => new Account(network, address));
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
    this.address.set(accounts[0]);
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
