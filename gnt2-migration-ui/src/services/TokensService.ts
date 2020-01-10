import {JsonRpcProvider} from 'ethers/providers';
import {BigNumber} from 'ethers/utils';
import {NewGolemNetworkTokenFactory, GolemNetworkTokenBatchingFactory, GolemNetworkTokenFactory} from 'gnt2-contracts';
import {ContractAddressService} from './ContractAddressService';
import {GolemTokenAddresses} from '../models/GolemTokenAddresses';

export class TokensService {
  private golemTokens: GolemTokenAddresses;
  constructor(
    private provider: () => JsonRpcProvider,
    private contractAddressService: ContractAddressService
  ) {
    this.golemTokens = contractAddressService.golemNetworkTokenAddress.get();
  }

  async balanceOfOldTokens(address: string, tokenAddress: string): Promise<BigNumber> {
    const oldTokenContract = GolemNetworkTokenFactory.connect(this.golemTokens.oldGolemTokenContractAddress, this.provider());
    return oldTokenContract.balanceOf(address);
  }

  async balanceOfNewTokens(address: string) {
    const newTokenContract = NewGolemNetworkTokenFactory.connect(this.golemTokens.newGolemTokenContractAddress, this.provider());
    return newTokenContract.balanceOf(address);
  }

  async migrateTokens(value: string) {
    const oldTokenContract = GolemNetworkTokenFactory.connect(this.golemTokens.oldGolemTokenContractAddress, this.provider().getSigner());
    await oldTokenContract.migrate(value, {gasLimit: 750000});
  }

  async balanceOfBatchingTokens(address: string) {
    const batchingContract = GolemNetworkTokenBatchingFactory.connect(this.golemTokens.batchingGolemTokenContractAddress, this.provider());
    return batchingContract.balanceOf(address);
  }
}
