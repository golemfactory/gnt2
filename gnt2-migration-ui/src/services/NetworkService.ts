import {AsyncSendable} from 'ethers/providers';
import '../types'
import {Callback} from 'reactive-properties/dist/Property';

export interface Subscribable {
  subscribe: (cb: Callback) => Callback;
}

export class NetworkService implements Subscribable {
  network: string = '';

  constructor(private globalEthereum: () => any) {
  }


  static create() {
    return new NetworkService(() => window.ethereum as any);
  }

  subscribe(callback: Callback): Callback {
    this.globalEthereum().on('chainChanged', (chainId: string) => {
      if (chainId === '4') {
        this.network = 'Rinkeby';
      } else {
        this.network = 'local';
      }
      callback();
    });
    return () => {}
  }

}
