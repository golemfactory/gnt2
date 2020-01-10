import {Property, State, withSubscription} from 'reactive-properties';
import {NetworkService} from './NetworkService';
import {getNetworks} from '../config';
import {GolemTokenAddresses} from '../models/GolemTokenAddresses';

export class ContractAddressService {
  golemNetworkTokenAddress: Property<GolemTokenAddresses>;
  private golemNetworkTokenAddressState: State<GolemTokenAddresses>;


  constructor(networkService: NetworkService) {
    this.golemNetworkTokenAddressState = new State({
      oldGolemTokenContractAddress: '',
      newGolemTokenContractAddress: '',
      batchingGolemTokenContractAddress: ''
    });
    // this.golemNetworkTokenAddress = networkService.network.map((networkName) => this.getGNTAddress(networkName));
    this.golemNetworkTokenAddress = this.golemNetworkTokenAddressState.pipe(withSubscription(() => {
      const network = this.getGNTAddress(networkService.network);
      this.golemNetworkTokenAddressState.set(network);
    }, networkService));
  }

  private getGNTAddress(network: string) {
    console.log(network);
    if (network === 'Rinkeby') {
      return getNetworks().rinkeby;
    }
    return getNetworks().local;
  }
}
