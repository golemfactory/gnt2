import {Property, State, withSubscription} from 'reactive-properties';
import {NetworkService} from './NetworkService';
import {getNetworks} from '../config';
import {GolemTokenAddresses} from '../types/GolemTokenAddresses';

export class ContractAddressService {
  golemNetworkTokenAddress: Property<GolemTokenAddresses>;
  private golemNetworkTokenAddressState: State<GolemTokenAddresses>;

  constructor(networkService: NetworkService) {
    this.golemNetworkTokenAddressState = new State({
      oldGolemTokenContractAddress: '',
      newGolemTokenContractAddress: '',
      batchingGolemTokenContractAddress: ''
    });
    this.golemNetworkTokenAddress = this.golemNetworkTokenAddressState.pipe(withSubscription(() => {
      const network = this.getGNTAddress(networkService.network.get());
      this.golemNetworkTokenAddressState.set(network);
    }, networkService));
  }

  private getGNTAddress(network: string | undefined) {
    if (network === 'Rinkeby') {
      return getNetworks().rinkeby;
    }
    return getNetworks().local;
  }
}
