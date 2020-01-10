import {JsonRpcProvider} from 'ethers/providers';
import {Callback} from 'reactive-properties/dist/Property';
import {Property, State, withSubscription} from 'reactive-properties';

export interface Subscribable {
  subscribe: (cb: Callback) => Callback;
}

export class AccountService implements Subscribable {
  private provider: () => JsonRpcProvider;
  private accountState: State<string>;
  account: Property<string>;

  constructor(provider: () => JsonRpcProvider, private globalEthereum: () => any) {
    this.provider = provider;
    this.accountState = new State<string>('');
    this.account = this.accountState.pipe(withSubscription(async () => {
      const account = await this.getDefaultAccount();
      this.accountState.set(account);
      return account;
    }, this));
  }

  static create(provider: () => JsonRpcProvider) {
    return new AccountService(provider, () => window.ethereum as any);
  }

  balanceOf(address: string) {
    return this.provider().getBalance(address);
  }

  async getDefaultAccount(): Promise<string> {
    return (await this.provider().listAccounts())[0];
  }

  subscribe(callback: Callback): Callback {
    this.globalEthereum().on('accountsChanged', async () => {
      callback();
    });
    return () => { /* do nothing */ };
  }

}
