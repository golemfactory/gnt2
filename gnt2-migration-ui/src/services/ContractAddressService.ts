import {map, Property} from 'reactive-properties';
import {GolemTokenAddresses, NetworkName, TokenContractsAddresses} from '../config';
import {ConnectionService} from './ConnectionService';

export class ContractAddressService {
  golemNetworkTokenAddress: Property<GolemTokenAddresses>;

  constructor(connectionService: ConnectionService, private tokenContractsAddresses: TokenContractsAddresses) {
    this.golemNetworkTokenAddress = connectionService.network.pipe(map(networkName => this.getGNTAddress(networkName)));
  }

  private getGNTAddress(network: NetworkName) {
    return this.tokenContractsAddresses[network];
  }
}
