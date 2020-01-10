import {AccountService} from './AccountsService';
import {ConnectionService} from './ConnectionService';
import {TokensService} from './TokensService';
import {NetworkService} from './NetworkService';
import {ContractAddressService} from './ContractAddressService';
import {MetamaskNetworkService} from './MetamaskNetworkService';

export type Services = ReturnType<typeof createServices>;

export function createServices() {
  const metamaskNetworkService = MetamaskNetworkService.create();
  const connectionService = ConnectionService.create();
  const getProvider = () => connectionService.getProvider();
  const accountService = AccountService.create(getProvider);
  const networkService = NetworkService.create(metamaskNetworkService);
  const contractAddressService = new ContractAddressService(networkService);
  const tokensService = new TokensService(getProvider, contractAddressService);
  const startServices = async () => {
    await connectionService.checkConnection();
  };

  return {
    networkService,
    contractAddressService,
    accountService,
    connectionService,
    tokensService,
    startServices
  };
}
