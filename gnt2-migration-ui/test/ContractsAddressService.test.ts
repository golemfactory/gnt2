import {expect} from 'chai';
import {Callback} from 'reactive-properties/dist/Property';
import {ContractAddressService} from '../src/services/ContractAddressService';
import {State} from 'reactive-properties';
import {ConnectionService} from '../src/services/ConnectionService';

describe('Contract Address Service', () => {
  it('updates contract addresses on network change', async () => {
    let callback = () => { /* do nothing */ };
    const connectionService = {
      subscribe: (cb: Callback): Callback => {
        callback = cb;
        return () => { /* do nothing */ };
      },
      network: new State('4')
    };
    const contractAddressService = new ContractAddressService(connectionService as unknown as ConnectionService);
    contractAddressService.golemNetworkTokenAddress.subscribe(() => { /* do nothing */ });
    expect(contractAddressService.golemNetworkTokenAddress.get()).to.deep.eq({
      oldGolemToken: '',
      newGolemToken: '',
      batchingGolemToken: ''
    });
    callback();
    expect(contractAddressService.golemNetworkTokenAddress.get()).to.deep.eq({
      oldGolemToken: '0xA193E42526F1FEA8C99AF609dcEabf30C1c29fAA',
      newGolemToken: '0xaC8444e7d45c34110B34Ed269AD86248884E78C7',
      batchingGolemToken: '0xf278DDe7F235D1736d1981a036637A5B9Cf20316'
    });
  });
});
