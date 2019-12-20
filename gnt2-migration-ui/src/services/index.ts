import {AccountService} from './AccountsService';
import {ConnectionService} from './connectionService';

export type Services = ReturnType<typeof createServices>;

export function createServices() {
  const connectionService = ConnectionService.create();
  const accountService = new AccountService(() => connectionService.getProvider());

  return {
    accountService,
    connectionService
  };
}
