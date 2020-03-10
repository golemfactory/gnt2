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
    return this.gntContract().balanceOf(address);
  }

  async balanceOfNewTokens(address: string) {
    return this.ngntContract().balanceOf(address);
  }

  async migrateAllTokens(address: string): Promise<ContractTransaction> {
    return this.gntContractAsSigner(address).migrate(await this.balanceOfOldTokens(address), {gasLimit});
  }

  async balanceOfBatchingTokens(address: string) {
    return this.gntbContract().balanceOf(address);
  }

  async balanceOfDeposit(address: string) {
    return this.gntDepositContract().balanceOf(address);
  }

  async getDepositState(address: string): Promise<DepositState> {
    const depositContract = this.gntDepositContract();
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
    return this.gntDepositContract().getTimelock(address);
  }

  async moveToWrapped(address: string): Promise<ContractTransaction> {
    return this.gntDepositContractAsSigner(address).withdraw(address, {gasLimit: gasLimit});
  }

  unlockDeposit(address: string): Promise<ContractTransaction> {
    return this.gntDepositContractAsSigner(address).unlock();
  }

  async unwrap(address: string): Promise<ContractTransaction> {
    const tokensToUnwrap = await this.balanceOfBatchingTokens(address);
    return this.gntbContractAsSigner(address).withdraw(tokensToUnwrap);
  }

  private gntDepositContract() {
    return GNTDepositFactory.connect(this.tokenContractsAddresses().gntDeposit, this.provider());
  }

  private gntDepositContractAsSigner(address: string) {
    return GNTDepositFactory.connect(this.tokenContractsAddresses().gntDeposit, this.provider().getSigner(address));
  }

  private gntContract() {
    return GolemNetworkTokenFactory.connect(this.tokenContractsAddresses().oldGolemToken, this.provider());
  }

  private gntContractAsSigner(address: string) {
    return GolemNetworkTokenFactory.connect(this.tokenContractsAddresses().oldGolemToken, this.provider().getSigner(address));
  }

  private ngntContract() {
    return NewGolemNetworkTokenFactory.connect(this.tokenContractsAddresses().newGolemToken, this.provider());
  }

  private gntbContract() {
    return GolemNetworkTokenBatchingFactory.connect(this.tokenContractsAddresses().batchingGolemToken, this.provider());
  }

  private gntbContractAsSigner(address: string) {
    return GolemNetworkTokenBatchingFactory.connect(this.tokenContractsAddresses().batchingGolemToken, this.provider().getSigner(address));
  }
}
