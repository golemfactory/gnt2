import sinon from 'sinon';
import '../../src/types';


export class MockedEthereum implements MetamaskEthereum {
  isMetaMask: true;
  send = sinon.mock().returns({result: '4'});
  private mockedEthereumCallback: (params?: any) => void = () => { /* empty */
  };

  constructor() {
    this.isMetaMask = true;
  }

  simulateAccountChanged(accounts: string[] = []) {
    this.mockedEthereumCallback(accounts);
  }

  simulateNetworkChange(network = '') {
    this.mockedEthereumCallback(network);
  }

  on(eventName: string, callback: () => void) {
    this.mockedEthereumCallback = callback;
  }

  off(eventName: string, callback: () => void) {
  }
}
