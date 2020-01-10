import {expect} from 'chai';
import {NetworkService} from '../src/services/NetworkService';
import {Callback} from 'reactive-properties/dist/Property';
import {ContractAddressService} from '../src/services/ContractAddressService';

describe('Contract Address Service', () => {
  it('updates contract addresses on network change', async () => {
    let callback = () => {
    };
    const networkService = {
      subscribe: (cb: Callback): Callback => {
        callback = cb;
        return () => {}
      },
      network: 'Rinkeby'
    };
    const contractAddressService = new ContractAddressService(networkService as NetworkService);
    contractAddressService.golemNetworkTokenAddress.subscribe(() => {
    });
    expect(contractAddressService.golemNetworkTokenAddress.get()).to.eq('');
    callback();
    expect(contractAddressService.golemNetworkTokenAddress.get()).to.eq('0x042423421');
  });
});
