import {expect} from 'chai';
import '../../src/types';
import {ContractAddressService} from '../../src/services/ContractAddressService';
import {State} from 'reactive-properties';
import {ConnectionService} from '../../src/services/ConnectionService';
import {NetworkName} from '../../src/domain/Network';
import config from '../../src/config';

describe('Contract Address Service', () => {
  it('updates contract addresses on network change', async () => {
    const connectionService = {
      network: new State<NetworkName>('local')
    };
    const contractAddressService = new ContractAddressService(connectionService as unknown as ConnectionService, config.contractAddresses);
    expect(contractAddressService.contractAddresses.get()).to.deep.eq({
      oldGolemToken: '0xA193E42526F1FEA8C99AF609dcEabf30C1c29fAA',
      newGolemToken: '0x94BA4d5Ebb0e05A50e977FFbF6e1a1Ee3D89299c',
      batchingGolemToken: '0xCA633a093C280377ac8449E0cdA64Efd839C976c',
      gntDeposit: '0xbD73caE58B275Dce33fBf7877F40434623A1E6a9',
      migrationAgent: '0xaC8444e7d45c34110B34Ed269AD86248884E78C7'
    });
    expect(contractAddressService.hasContracts.get()).to.be.true;
    connectionService.network.set('rinkeby');
    expect(contractAddressService.contractAddresses.get()).to.deep.eq({
      oldGolemToken: '0xf29f58E2C0A718B1f7b925450585cA42ABa5cE36',
      newGolemToken: '0x021eb5b4fE672Ff4A4C66656108544676D62735E',
      batchingGolemToken: '0x234E4151f828Cb5141ACA8436405EB8D5C04a06B',
      gntDeposit: '0x3a3bED8432175905c8949a5411BCeac8F4aB00E8',
      migrationAgent: '0x249FE202a043C4e87B4518b9188359E54e1E8C68'
    });
    expect(contractAddressService.hasContracts.get()).to.be.true;
  });

});
