import {JsonRpcProvider} from 'ethers/providers';

export class AccountService {
  private provider: () => JsonRpcProvider;
  constructor(provider: () => JsonRpcProvider) {
    this.provider = provider;
  }

  balanceOf(address: string) {
    return this.provider().getBalance(address);
  }

  async getDefaultAccount(): Promise<string> {
    return (await this.provider().listAccounts())[0];
  }
}
