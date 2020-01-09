import {JsonRpcProvider} from 'ethers/providers';
import {BigNumber} from 'ethers/utils';
import {NewGolemNetworkTokenFactory, GolemNetworkTokenBatchingFactory, GolemNetworkTokenFactory} from 'gnt2-contracts';

export class TokensService {
  constructor(
    private provider: () => JsonRpcProvider,
    private oldGolemTokenContractAddress: string,
    private newGolemTokenContractAddress: string,
    private batchingGolemTokenContractAddress: string
  ) {}


  async balanceOfOldTokens(address: string): Promise<BigNumber> {
    const oldTokenContract = GolemNetworkTokenFactory.connect('0x924442A66cFd812308791872C4B242440c108E19', this.provider());
    return oldTokenContract.balanceOf(address);
  }

  async balanceOfNewTokens(address: string) {
    const newTokenContract = NewGolemNetworkTokenFactory.connect('0xef6A0668be10276f6B74eB80593B01B5d0606a2f', this.provider());
    return newTokenContract.balanceOf(address);
  }

  async migrateTokens(value: string) {
    const oldTokenContract = GolemNetworkTokenFactory.connect('0x924442A66cFd812308791872C4B242440c108E19', this.provider().getSigner());
    await oldTokenContract.migrate(value, {gasLimit: 750000});
  }

  async balanceOfBatchingTokens(address: string) {
    const batchingContract = GolemNetworkTokenBatchingFactory.connect('0x123438d379BAbD07134d1d4d7dFa0BCbd56ca3F3', this.provider());
    return batchingContract.balanceOf(address);
  }
}
