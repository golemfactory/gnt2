import {ConnectionService} from './ConnectionService';
import {TokensService} from './TokensService';
import {ContractAddressService} from './ContractAddressService';
import {TransactionsService} from './TransactionService';
import config from '../config';
import {EtherService} from './EtherService';

export type Services = ReturnType<typeof createServices>;

export function createServices() {
  const connectionService = ConnectionService.create();
  const getProvider = () => connectionService.getProvider();
  const contractAddressService = new ContractAddressService(connectionService, config.contractAddresses);
  const tokensService = new TokensService(getProvider, contractAddressService, connectionService, config.gasLimit);
  const startServices = async () => {
    await connectionService.checkConnection();
    await connectionService.checkNetwork();
  };
  const transactionService = new TransactionsService(getProvider, connectionService, config.confirmationHeights);
  const etherService = new EtherService(getProvider, connectionService);

  return {
    contractAddressService,
    connectionService,
    tokensService,
    startServices,
    transactionService,
    etherService
  };
}
