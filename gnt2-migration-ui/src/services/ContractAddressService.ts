import {map, Property} from 'reactive-properties';
import {ContractAddresses, ContractAddressesByNetwork} from '../config';
import {ConnectionService} from './ConnectionService';
import {AddressZero} from 'ethers/constants';

const emptyContractAddresses: ContractAddresses = {
  batchingGolemToken: AddressZero,
  oldGolemToken: AddressZero,
  gntDeposit: AddressZero,
  newGolemToken: AddressZero,
  migrationAgent: AddressZero
};

export class ContractAddressService {
  contractAddresses: Property<ContractAddresses>;

  hasContracts: Property<boolean>;

  constructor(connectionService: ConnectionService, private contractAddressesConfig: ContractAddressesByNetwork) {
    this.contractAddresses = connectionService.network.pipe(map(networkName => (
      networkName && this.contractAddressesConfig[networkName]) ||
      emptyContractAddresses)
    );
    this.hasContracts = this.contractAddresses.pipe(map(contractAddresses => contractAddresses !== emptyContractAddresses));
  }
}
