import {Property, State, withSubscription} from 'reactive-properties';
import {tokenContractsAddresses} from '../config';
import {ConnectionService} from './ConnectionService';

export interface GolemTokenAddresses {
  oldGolemToken: string;
  newGolemToken: string;
  batchingGolemToken: string;
}

export class ContractAddressService {
  golemNetworkTokenAddress: Property<GolemTokenAddresses>;
  private golemNetworkTokenAddressState: State<GolemTokenAddresses>;

  constructor(connectionService: ConnectionService) {
    this.golemNetworkTokenAddressState = new State(tokenContractsAddresses.rinkeby);
    this.golemNetworkTokenAddress = this.golemNetworkTokenAddressState.pipe(withSubscription(() => {
      const tokenContractsAddresses = this.getGNTAddress(connectionService.network.get());
      this.golemNetworkTokenAddressState.set(tokenContractsAddresses);
    }, connectionService));
  }

  private getGNTAddress(network: string | undefined) {
    if (network === 'Rinkeby') {
      return tokenContractsAddresses.rinkeby;
    }
    return tokenContractsAddresses.local;
  }
}
