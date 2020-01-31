import {map, Property} from 'reactive-properties';
import {ContractAddresses, ContractAddressesByNetwork} from '../config';
import {ConnectionService} from './ConnectionService';

export class ContractAddressService {
  contractAddresses: Property<ContractAddresses>;

  constructor(connectionService: ConnectionService, private contractAddressesConfig: ContractAddressesByNetwork) {
    this.contractAddresses = connectionService.network.pipe(map(networkName => this.contractAddressesConfig[networkName]));
  }
}
