import sinon from 'sinon';

let mockedEthereumCallback: (params?: any) => void = () => { /* empty */ };

export class MockedEthereum {
  isMetaMask: true;
  send = sinon.mock().returns('4');
  constructor() {
    this.isMetaMask = true;
  }

  simulateAccountChanged(accounts: string[] = []) {
    mockedEthereumCallback(accounts);
  }

  simulateNetworkChange(network = '') {
    mockedEthereumCallback(network);
  }

  on(eventName: string, callback: () => void) {
    mockedEthereumCallback = callback;
  }

  off(eventName: string, callback: () => void) {
    mockedEthereumCallback = callback;
  }
}
