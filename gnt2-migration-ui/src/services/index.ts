import {AccountService} from './AccountsService';
import {ConnectionService} from './ConnectionService';
import {TokensService} from './TokensService';
import {ContractAddressService} from './ContractAddressService';
import {RefreshService} from './RefreshService';
import {TransactionsService} from './TransactionService';
import config from '../config';

export type Services = ReturnType<typeof createServices>;

export function createServices() {
  const connectionService = ConnectionService.create();
  const getProvider = () => connectionService.getProvider();
  const accountService = new AccountService(getProvider);
  const contractAddressService = new ContractAddressService(connectionService, config.contractAddresses);
  const tokensService = new TokensService(getProvider, contractAddressService, connectionService, config.gasLimit);
  const startServices = async () => {
    await connectionService.checkConnection();
    await connectionService.checkNetwork();
  };
  const refreshService = new RefreshService();
  const transactionService = new TransactionsService(getProvider, connectionService, config.confirmationHeights);

  return {
    contractAddressService,
    accountService,
    connectionService,
    tokensService,
    startServices,
    refreshService,
    transactionService
  };
}
