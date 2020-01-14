import {JsonRpcProvider} from 'ethers/providers';
import {BigNumber} from 'ethers/utils';
import {GolemNetworkTokenBatchingFactory, GolemNetworkTokenFactory, NewGolemNetworkTokenFactory} from 'gnt2-contracts';
import {InsufficientFunds, MetamaskError, TransactionDenied, UnknownError} from '../errors';

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
    return oldTokenContract.migrate(value)
      .then((tx) => {
        return tx.hash;
      }, (error) => {
        return errorMessage(error.code.toString());
      });
  }

  async balanceOfBatchingTokens(address: string) {
    const batchingContract = GolemNetworkTokenBatchingFactory.connect(this.batchingGolemTokenContractAddress, this.provider());
    return batchingContract.balanceOf(address);
  }
}

const errorMessage = (code: string) => {
  switch (code) {
    case '-32000':
      throw new InsufficientFunds();
    case '4001':
      throw new TransactionDenied();
    case '-32603':
      throw new MetamaskError();
    default:
      throw new UnknownError();
  }
};
