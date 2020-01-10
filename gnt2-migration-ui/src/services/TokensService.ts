import {JsonRpcProvider} from 'ethers/providers';
import {BigNumber} from 'ethers/utils';
import {NewGolemNetworkTokenFactory, GolemNetworkTokenBatchingFactory, GolemNetworkTokenFactory} from 'gnt2-contracts';
import {ContractAddressService} from './ContractAddressService';
import {GolemTokenAddresses} from '../types/GolemTokenAddresses';

export class TokensService {
  private golemTokens: GolemTokenAddresses;
  constructor(
    private provider: () => JsonRpcProvider,
    private contractAddressService: ContractAddressService
  ) {
    this.golemTokens = this.contractAddressService.golemNetworkTokenAddress.get();
  }

  getAddress() { return this.contractAddressService.golemNetworkTokenAddress.get(); }

  async balanceOfOldTokens(address: string): Promise<BigNumber> {
    const oldTokenContract = GolemNetworkTokenFactory.connect(this.getAddress().oldGolemTokenContractAddress, this.provider());
    return oldTokenContract.balanceOf(address);
  }

  async balanceOfNewTokens(address: string) {
    const newTokenContract = NewGolemNetworkTokenFactory.connect(this.getAddress().newGolemTokenContractAddress, this.provider());
    return newTokenContract.balanceOf(address);
  }

  async migrateTokens(value: string) {
    const oldTokenContract = GolemNetworkTokenFactory.connect(this.getAddress().oldGolemTokenContractAddress, this.provider().getSigner());
    await oldTokenContract.migrate(value, {gasLimit: 750000});
  }

  async balanceOfBatchingTokens(address: string) {
    const batchingContract = GolemNetworkTokenBatchingFactory.connect(this.getAddress().batchingGolemTokenContractAddress, this.provider());
    return batchingContract.balanceOf(address);
  }
}
