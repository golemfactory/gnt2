import {MetamaskProvider} from './MetamaskService';
import {AccountService} from './AccountsService';

export type Services = ReturnType<typeof createServices>;

export function createServices() {
  const accountService = new AccountService(new MetamaskProvider());

  return {
    accountService
  };
}
