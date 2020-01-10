import {AccountService} from './AccountsService';
import {ConnectionService} from './ConnectionService';
import {TokensService} from './TokensService';
import {NetworkService} from './NetworkService';
import {ContractAddressService} from './ContractAddressService';

export type Services = ReturnType<typeof createServices>;

export function createServices() {

  const connectionService = ConnectionService.create();
  const getProvider = () => connectionService.getProvider();
  const accountService = new AccountService(getProvider);
  const networkService = NetworkService.create();
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
