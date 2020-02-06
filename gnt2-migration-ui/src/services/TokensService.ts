import {JsonRpcProvider} from 'ethers/providers';
import {BigNumber} from 'ethers/utils';
import {
  NewGolemNetworkTokenFactory,
  GolemNetworkTokenBatchingFactory,
  GolemNetworkTokenFactory,
  GNTDepositFactory
} from 'gnt2-contracts';
import {ContractAddressService} from './ContractAddressService';
import {gasLimit} from '../config';
import {mapCodeToError} from '../utils/mapCodeToError';

export enum DepositState {
  LOCKED,
  TIME_LOCKED,
  UNLOCKED,
  EMPTY
}

export class TokensService {
  constructor(
    private provider: () => JsonRpcProvider,
    private contractAddressService: ContractAddressService
  ) {}

  tokenContractsAddresses() { return this.contractAddressService.contractAddresses.get(); }

  async balanceOfOldTokens(address: string): Promise<BigNumber> {
    const oldTokenContract = GolemNetworkTokenFactory.connect(this.tokenContractsAddresses().oldGolemToken, this.provider());
    return oldTokenContract.balanceOf(address);
  }

  async balanceOfNewTokens(address: string) {
    const newTokenContract = NewGolemNetworkTokenFactory.connect(this.tokenContractsAddresses().newGolemToken, this.provider());
    return newTokenContract.balanceOf(address);
  }

  async migrateAllTokens(account: string): Promise<string | undefined> {
    const oldTokenContract = GolemNetworkTokenFactory.connect(this.tokenContractsAddresses().oldGolemToken, this.provider().getSigner());
    try {
      return (await oldTokenContract.migrate(await this.balanceOfOldTokens(account), {gasLimit})).hash;
    } catch (error) {
      throw mapCodeToError(error);
    }
  }

  async balanceOfBatchingTokens(address: string) {
    const batchingContract = GolemNetworkTokenBatchingFactory.connect(this.tokenContractsAddresses().batchingGolemToken, this.provider());
    return batchingContract.balanceOf(address);
  }

  async balanceOfDepositTokens(address: string) {
    const depositContract = GNTDepositFactory.connect(this.tokenContractsAddresses().gntDeposit, this.provider());
    return depositContract.balanceOf(address);
  }

  async isDepositLocked(address: string) {
    const depositContract = GNTDepositFactory.connect(this.tokenContractsAddresses().gntDeposit, this.provider());
    if ((await depositContract.balanceOf(address)).toString() === '0') {
      return DepositState.EMPTY;
    } else if (await depositContract.isLocked(address)) {
      return DepositState.LOCKED;
    } else if (await depositContract.isUnlocked(address)) {
      return DepositState.UNLOCKED;
    } else {
      return DepositState.TIME_LOCKED;
    }
  }

  async getDepositUnlockTime(address: string) {
    const depositContract = GNTDepositFactory.connect(this.tokenContractsAddresses().gntDeposit, this.provider());
    return depositContract.getTimelock(address);
  }
}
