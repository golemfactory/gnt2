import {AccountService} from './AccountsService';
import {ConnectionService} from './connectionService';
import {TokensService} from './TokensService';

export type Services = ReturnType<typeof createServices>;

export function createServices() {
  const connectionService = ConnectionService.create();
  const getProvider = () => connectionService.getProvider();
  const accountService = new AccountService(getProvider);
  const tokensService = new TokensService(getProvider, oldGolemTokenContractAddress, newGolemTokenContractAddress);

  return {
    accountService,
    connectionService,
    tokensService
  };
}
