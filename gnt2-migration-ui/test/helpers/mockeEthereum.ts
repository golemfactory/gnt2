import sinon from 'sinon';

let mockedEthereumCallback: (params?: any) => void = () => { /* empty */ };

export const mockedEthereum = {
  simulateAccountChanged: function (accounts: string[] = []) {
    mockedEthereumCallback(accounts);
  },
  simulateNetworkChange: function (network = '') {
    mockedEthereumCallback(network);
  },
  send: sinon.mock().returns('4'),
  isMetaMask: true,
  on: (eventName: string, callback: () => void) => {
    mockedEthereumCallback = callback;
  },
  off: (eventName: string, callback: () => void) => {
    mockedEthereumCallback = callback;
  }
};
