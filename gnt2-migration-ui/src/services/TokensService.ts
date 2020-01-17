import {JsonRpcProvider} from 'ethers/providers';
import {BigNumber} from 'ethers/utils';
import {GolemNetworkTokenBatchingFactory, GolemNetworkTokenFactory, NewGolemNetworkTokenFactory} from 'gnt2-contracts';
import {mapCodeToError} from '../utils/mapCodeToError';

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

  async migrateTokens(value: string) {
    const oldTokenContract = GolemNetworkTokenFactory.connect(this.oldGolemTokenContractAddress, this.provider().getSigner());
    const transactionHash = await oldTokenContract.migrate(value)
      .then((tx) => {
        return tx.hash;
      }, (error) => {
        throw mapCodeToError(error);
      });
    return transactionHash;
  }

  async balanceOfBatchingTokens(address: string) {
    const batchingContract = GolemNetworkTokenBatchingFactory.connect(this.batchingGolemTokenContractAddress, this.provider());
    return batchingContract.balanceOf(address);
  }
}
