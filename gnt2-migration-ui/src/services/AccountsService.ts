import {Provider} from 'ethers/providers';

export class AccountService {
  private provider: Provider;
  constructor(provider: Provider) {
    this.provider = provider;
  }

  balanceOf(address: string) {
    return this.provider.getBalance(address);
  }
}
