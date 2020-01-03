import {JsonRpcProvider} from 'ethers/providers';
import {GolemNetworkTokenFactory} from '../../../gnt2-contracts/build/contract-types/GolemNetworkTokenFactory';
import {BigNumber} from 'ethers/utils';
import {NewGolemNetworkTokenFactory} from '../../../gnt2-contracts';
import {GolemNetworkTokenBatchingFactory} from '../../../gnt2-contracts/build/contract-types/GolemNetworkTokenBatchingFactory';

export class TokensService {
  constructor(
    private provider: () => JsonRpcProvider,
    private oldGolemTokenContractAddress: string,
    private newGolemTokenContractAddress: string,
    private batchingGolemTokenContractAddress: string
  ) {}

  async balanceOfOldTokens(address: string): Promise<BigNumber> {
    const oldTokenContract = GolemNetworkTokenFactory.connect(this.oldGolemTokenContractAddress, this.provider());
    return oldTokenContract.balanceOf(address);
  }

  async balanceOfNewTokens(address: string) {
    const newTokenContract = NewGolemNetworkTokenFactory.connect(this.newGolemTokenContractAddress, this.provider());
    return newTokenContract.balanceOf(address);
  }

  async balanceOfBatchingTokens(address: string) {
    const batchingContract = GolemNetworkTokenBatchingFactory.connect(this.batchingGolemTokenContractAddress, this.provider());
    return batchingContract.balanceOf(address);
  }
}
