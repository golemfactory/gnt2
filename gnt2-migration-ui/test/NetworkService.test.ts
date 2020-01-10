import {expect} from 'chai';
import {NetworkService} from '../src/services/NetworkService';

class TestEthereum implements MetamaskEthereum {
  isMetaMask= true;
  networkVersion= '4';

  private callback: (chainId: string) => void = () => { /* do nothing */ };

  on(event: string, callback: (chainId: string) => void) {
    this.callback = callback;
  }

  simulateNetworkChange(chainId: string) {
    this.callback(chainId);
  }
}

describe('Network Service', () => {
  it('delivers network change event', () => {

    let networkChangeDetected = false;

    const mockedEthereum = new TestEthereum();

    const networkService = new NetworkService(() => mockedEthereum);
    networkService.subscribe(() => {
      networkChangeDetected = true;
    });

    mockedEthereum.simulateNetworkChange('4');

    expect(networkService.network.get()).to.eq('Rinkeby');
    expect(networkChangeDetected).to.be.true;
  });
});
