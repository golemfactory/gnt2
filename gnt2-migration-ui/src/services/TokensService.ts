import {JsonRpcProvider} from 'ethers/providers';
import {BigNumber} from 'ethers/utils';
import {
  GNTDepositFactory,
  GolemNetworkTokenBatchingFactory,
  GolemNetworkTokenFactory,
  NewGolemNetworkTokenFactory,
} from 'gnt2-contracts';
import {ContractAddressService} from './ContractAddressService';
import {gasLimit} from '../config';
import {ContractTransaction} from 'ethers';

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

  async migrateAllTokens(account: string): Promise<ContractTransaction> {
    const oldTokenContract = GolemNetworkTokenFactory.connect(this.tokenContractsAddresses().oldGolemToken, this.provider().getSigner());
    return oldTokenContract.migrate(await this.balanceOfOldTokens(account), {gasLimit});
  }

  async balanceOfBatchingTokens(address: string) {
    const batchingContract = GolemNetworkTokenBatchingFactory.connect(this.tokenContractsAddresses().batchingGolemToken, this.provider());
    return batchingContract.balanceOf(address);
  }

  async balanceOfDepositTokens(address: string) {
    const depositContract = GNTDepositFactory.connect(this.tokenContractsAddresses().gntDeposit, this.provider());
    return depositContract.balanceOf(address);
  }

  async getDepositState(address: string): Promise<DepositState> {
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

  async moveToWrapped(): Promise<ContractTransaction> {
    const holder = this.provider().getSigner();
    const depositContract = GNTDepositFactory.connect(this.tokenContractsAddresses().gntDeposit, holder);
    return depositContract.withdraw(await holder.getAddress(), {gasLimit: gasLimit});
  }

  unlockDeposit(): Promise<ContractTransaction> {
    const depositContract = GNTDepositFactory.connect(this.tokenContractsAddresses().gntDeposit, this.provider().getSigner());
    return depositContract.unlock();
  }

}
