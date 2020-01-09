import {expect} from 'chai';
import {NetworkService} from '../src/services/NetworkService';
import {Contract} from 'ethers';
import {Property, State, withSubscription} from 'reactive-properties';
import {Callback} from 'reactive-properties/dist/Property';

class ContractAddressService {
  golemNetworkTokenAddress: Property<string>;
  private golemNetworkTokenAddressState: State<string>;


  constructor(networkService: NetworkService) {
    this.golemNetworkTokenAddressState = new State('');
    this.golemNetworkTokenAddress = this.golemNetworkTokenAddressState.pipe(withSubscription(() => {
      this.golemNetworkTokenAddressState.set(this.getGNTAddress(networkService.network))
    }, networkService));
  }

  private getGNTAddress(network: string) {
    return '0x042423421';
  }
}

describe('Contract Address Service', () => {
  it('updates contract addresses on network change', () => {
    let callback = () => {};
    const networkService = {
      subscribe: (cb: Callback): Callback => {console.log('subscribed'); callback = cb; return () => {}},
      network: 'Rinkeby'
    };
    let mockedEthereum = {};
    const contractAddressService = new ContractAddressService(new NetworkService(mockedEthereum));
    // const contractAddressService = new ContractAddressService(networkService as NetworkService);
    expect(contractAddressService.golemNetworkTokenAddress.get()).to.eq('');
    callback();
    expect(contractAddressService.golemNetworkTokenAddress.get()).to.eq('0x042423421');
  });
});
