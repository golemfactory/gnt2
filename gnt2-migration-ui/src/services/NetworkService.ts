import '../types';
import {Callback} from 'reactive-properties/dist/Property';

export interface Subscribable {
  subscribe: (cb: Callback) => Callback;
}

const selectChain = (chainId: string) => {
  if (chainId === '4') {
    return 'Rinkeby';
  } else {
    return 'local';
  }
};

export class NetworkService implements Subscribable {
  network: string;

  constructor(private globalEthereum: () => any) {
    this.network = '';
  }


  static create() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NetworkService(() => window.ethereum as any);
  }

  subscribe(callback: Callback): Callback {
    const ethereum = this.globalEthereum();
    ethereum.on('networkChanged', (chainId: string) => {
      console.log('change triggered');
      this.network = selectChain(chainId);
      callback();
    });
    return () => { /* do nothing */ };
  }

}
