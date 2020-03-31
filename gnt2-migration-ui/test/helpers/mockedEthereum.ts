import sinon from 'sinon';
import '../../src/types';


export class MockedEthereum implements MetamaskEthereum {
  isMetaMask = true;
  send = sinon.mock().returns('4');
  private networkCallback: (params?: any) => void = () => { /* empty */ };

  private accountCallback: (params?: any) => void = () => { /* empty */ };

  simulateAccountChanged(accounts: string[] = []) {
    this.accountCallback(accounts);
  }

  simulateNetworkChange(network = '') {
    this.networkCallback(network);
  }

  on(eventName: string, callback: () => void) {
    if (eventName === 'accountsChanged') {
      this.accountCallback = callback;
    } else {
      this.networkCallback = callback;
    }
  }

  off(eventName: string, callback: () => void) { /* empty */ }
}
