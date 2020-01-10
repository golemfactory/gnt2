import {AccountService} from './AccountsService';
import {ConnectionService} from './connectionService';
import {TokensService} from './TokensService';
import {config} from '../config';
export type Services = ReturnType<typeof createServices>;

export function createServices() {
  const connectionService = ConnectionService.create();
  const getProvider = () => connectionService.getProvider();
  const accountService = new AccountService(getProvider);
  const tokensService = new TokensService(
    getProvider,
    config.oldGolemTokenContractAddress,
    config.newGolemTokenContractAddress,
    config.batchingGolemTokenContractAddress
  );
  const startServices = async () => {
    await connectionService.checkConnection();
  };

  return {
    accountService,
    connectionService,
    tokensService,
    startServices
  };
}
