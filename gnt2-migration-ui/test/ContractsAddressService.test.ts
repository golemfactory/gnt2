import {expect} from 'chai';
import '../src/types';
import {ContractAddressService} from '../src/services/ContractAddressService';
import {State} from 'reactive-properties';
import {ConnectionService} from '../src/services/ConnectionService';
import {NetworkName, contractAddressesConfig} from '../src/config';

describe('Contract Address Service', () => {
  it('updates contract addresses on network change', async () => {
    const connectionService = {
      network: new State<NetworkName>('local')
    };
    const contractAddressService = new ContractAddressService(connectionService as unknown as ConnectionService, contractAddressesConfig);
    expect(contractAddressService.contractAddresses.get()).to.deep.eq({
      oldGolemToken: '0xA193E42526F1FEA8C99AF609dcEabf30C1c29fAA',
      newGolemToken: '0x94BA4d5Ebb0e05A50e977FFbF6e1a1Ee3D89299c',
      batchingGolemToken: '0xCA633a093C280377ac8449E0cdA64Efd839C976c',
      gntDeposit: '0xbD73caE58B275Dce33fBf7877F40434623A1E6a9'
    });
    connectionService.network.set('rinkeby');
    expect(contractAddressService.contractAddresses.get()).to.deep.eq({
      oldGolemToken: '0x5f04440eeBE94581152C1654fF06726043114461',
      newGolemToken: '0x3D775f0285ce59B470cFb21F82B5C6Aa2B931f16',
      batchingGolemToken: '0x22f8707c775aEF9243B751F6831B59BfC85A4175',
      gntDeposit: '0xD08D7EAd2b8FFA32dcF32754280484F4982c3c4B'
    });
  });
});
