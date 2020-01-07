import {JsonRpcProvider} from 'ethers/providers';
import {GolemNetworkTokenFactory} from '../../../gnt2-contracts/build/contract-types/GolemNetworkTokenFactory';
import {BigNumber} from 'ethers/utils';
import {NewGolemNetworkTokenFactory} from '../../../gnt2-contracts';

export class TokensService {
  constructor(private provider: () => JsonRpcProvider, private oldGolemTokenContractAddress: string, private newGolemTokenContractAddress: string) {
  }

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
    await oldTokenContract.migrate(value);
  }
}
