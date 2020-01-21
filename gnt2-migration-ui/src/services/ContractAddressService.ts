import {Property, State, withSubscription} from 'reactive-properties';
import {GolemTokenAddresses, TokenContractsAddresses} from '../config';
import {ConnectionService} from './ConnectionService';

export class ContractAddressService {
  golemNetworkTokenAddress: Property<GolemTokenAddresses>;
  private golemNetworkTokenAddressState: State<GolemTokenAddresses>;

  constructor(connectionService: ConnectionService, private tokenContractsAddresses: TokenContractsAddresses) {
    this.golemNetworkTokenAddressState = new State(tokenContractsAddresses.rinkeby);
    this.golemNetworkTokenAddress = this.golemNetworkTokenAddressState.pipe(withSubscription(() => {
      const tokenContractsAddresses = this.getGNTAddress(connectionService.network.get());
      this.golemNetworkTokenAddressState.set(tokenContractsAddresses);
    }, connectionService));
  }

  private getGNTAddress(network: string | undefined) {
    if (network === 'Rinkeby') {
      return this.tokenContractsAddresses.rinkeby;
    }
    return this.tokenContractsAddresses.local;
  }
}
