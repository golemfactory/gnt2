import {expect} from 'chai';
import '../src/types';
import {ContractAddressService} from '../src/services/ContractAddressService';
import {State} from 'reactive-properties';
import {ConnectionService} from '../src/services/ConnectionService';
import {contractAddressesConfig, NetworkName} from '../src/config';

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
      gntDeposit: '0xbD73caE58B275Dce33fBf7877F40434623A1E6a9',
      migrationAgent: '0xaC8444e7d45c34110B34Ed269AD86248884E78C7'
    });
    expect(contractAddressService.hasContracts.get()).to.be.true;
    connectionService.network.set('rinkeby');
    expect(contractAddressService.contractAddresses.get()).to.deep.eq({
      oldGolemToken: '0x35017049a0D75707484474c8C5415B639Ae2938D',
      newGolemToken: '0x9eA04974BA834be90fF68779Fc811983795D1198',
      batchingGolemToken: '0x7f42f3F1c22c9266F360f83Bdb436e2dc79C89C2',
      gntDeposit: '0xfD75A6d50055D6eEC6f568464E78963ceC38Bc07',
      migrationAgent: '0x6379653453492BBd9D20931e0293518D77F'
    });
    expect(contractAddressService.hasContracts.get()).to.be.true;
  });

});
