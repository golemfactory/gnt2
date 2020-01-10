import '../types';
import {Callback} from 'reactive-properties/dist/Property';
import {MetamaskNetworkService} from './MetamaskNetworkService';

export interface Subscribable {
  subscribe: (cb: Callback) => Callback;
}

const selectChain = (chainId: string | undefined) => {
  if (chainId === '4') {
    return 'Rinkeby';
  } else {
    return 'local';
  }
};

export class NetworkService implements Subscribable {
  network: string | undefined;

  constructor(private globalEthereum: () => any, metamaskNetworkService: MetamaskNetworkService) {
    this.network = selectChain(metamaskNetworkService.getNetwork());
  }


  static create(metamaskNetworkService: MetamaskNetworkService) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NetworkService(() => window.ethereum as any, metamaskNetworkService);
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
