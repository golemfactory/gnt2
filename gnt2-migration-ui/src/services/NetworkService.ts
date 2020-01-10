import '../types';
import {Callback} from 'reactive-properties/dist/Property';
import {Property, State, withSubscription} from 'reactive-properties';

export interface Subscribable {
  subscribe: (cb: Callback) => Callback;
}

const selectChain = (chainId: string | undefined): string => {
  if (chainId === '4') {
    return 'Rinkeby';
  } else {
    return 'local';
  }
};

export class NetworkService implements Subscribable {
  private networkState: State<string>;
  network: Property<string>;

  constructor(private globalEthereum: () => MetamaskEthereum) {
    this.networkState = new State('');
    this.network = this.networkState.pipe(withSubscription(() => {
      this.networkState.set(selectChain(this.globalEthereum().networkVersion));
    }, this));
  }

  static create() {
    return new NetworkService(() => window.ethereum);
  }

  subscribe(callback: Callback): Callback {
    this.globalEthereum().on('networkChanged', (chainId: string) => {
      this.networkState.set(selectChain(chainId));
      callback();
    });
    return () => { /* do nothing */ };
  }

  async checkNetwork() {
    await this.networkState.set(selectChain(this.globalEthereum().networkVersion));
  }
}
