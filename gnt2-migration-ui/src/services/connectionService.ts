import {JsonRpcProvider, Web3Provider} from 'ethers/providers';
import '../types';
import {State} from 'reactive-properties';

export enum ConnectionState {
  UNKNOWN,
  NO_METAMASK,
  NOT_CONNECTED,
  CONNECTED
}

export class ConnectionService {
  private provider: JsonRpcProvider | undefined;
  connectionState: ConnectionState;
  account: State<string>;

  constructor(private getGlobalEthereum: () => MetamaskEthereum | undefined) {
    this.connectionState = ConnectionState.UNKNOWN;
    this.account = new State<string>('');
  }

  static create() {
    const connectionService = new ConnectionService(() => window.ethereum);
    connectionService.createProvider();
    return connectionService;
  }

  private createProvider() {
    const metamaskProvider = this.getGlobalEthereum();
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
}
