import {AccountService} from './AccountsService';
import {ConnectionService} from './ConnectionService';
import {TokensService} from './TokensService';
import {ContractAddressService} from './ContractAddressService';
import {contractAddressesConfig} from '../config';
import {RefreshService} from './RefreshService';

export type Services = ReturnType<typeof createServices>;

export function createServices() {
  const connectionService = ConnectionService.create();
  const getProvider = () => connectionService.getProvider();
  const accountService = new AccountService(getProvider);
  const contractAddressService = new ContractAddressService(connectionService, contractAddressesConfig);
  const tokensService = new TokensService(getProvider, contractAddressService, connectionService);
  const startServices = async () => {
    await connectionService.checkConnection();
    await connectionService.checkNetwork();
  };
  const refreshService = new RefreshService();

  return {
    contractAddressService,
    accountService,
    connectionService,
    tokensService,
    startServices,
    refreshService
  };
}
