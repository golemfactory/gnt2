import {expect} from 'chai';
import '../src/types';
import {ContractAddressService} from '../src/services/ContractAddressService';
import {State} from 'reactive-properties';
import {ConnectionService} from '../src/services/ConnectionService';
import {NetworkName, tokenContractsAddresses} from '../src/config';

describe('Contract Address Service', () => {
  it('updates contract addresses on network change', async () => {
    let callback = () => { /* do nothing */ };
    const connectionService = {
      subscribe: (cb: Callback): Callback => {
        callback = cb;
        return () => { /* do nothing */ };
      },
      network: new State<NetworkName>('local')
    };
    const contractAddressService = new ContractAddressService(connectionService as unknown as ConnectionService, tokenContractsAddresses);
    contractAddressService.golemNetworkTokenAddress.subscribe(() => { /* do nothing */ });
    expect(contractAddressService.golemNetworkTokenAddress.get()).to.deep.eq({
      oldGolemToken: '0x924442A66cFd812308791872C4B242440c108E19',
      newGolemToken: '0xef6A0668be10276f6B74eB80593B01B5d0606a2f',
      batchingGolemToken: '0x123438d379BAbD07134d1d4d7dFa0BCbd56ca3F3',
      gntDeposit: '0xa7dfb33234098c66fde44907e918dad70a3f211c'
    });
    callback();
    expect(contractAddressService.golemNetworkTokenAddress.get()).to.deep.eq({
      oldGolemToken: '0xA193E42526F1FEA8C99AF609dcEabf30C1c29fAA',
      newGolemToken: '0xaC8444e7d45c34110B34Ed269AD86248884E78C7',
      batchingGolemToken: '0xf278DDe7F235D1736d1981a036637A5B9Cf20316',
      gntDeposit: '0xDD547519c6D11A8eA57B98A752EeBB903D154A3B'
    });
  });
});
