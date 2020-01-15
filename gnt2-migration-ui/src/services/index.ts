import {AccountService} from './AccountsService';
import {ConnectionService} from './ConnectionService';
import {TokensService} from './TokensService';
import {ContractAddressService} from './ContractAddressService';

export type Services = ReturnType<typeof createServices>;

export function createServices() {
  const connectionService = ConnectionService.create();
  const getProvider = () => connectionService.getProvider();
  const accountService = new AccountService(getProvider);
  const contractAddressService = new ContractAddressService(connectionService);
  const tokensService = new TokensService(getProvider, contractAddressService);
  const startServices = async () => {
    await connectionService.checkConnection();
    await connectionService.checkNetwork();
  };

  return {
    contractAddressService,
    accountService,
    connectionService,
    tokensService,
    startServices
  };
}
