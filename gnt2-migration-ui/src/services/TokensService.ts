import {JsonRpcProvider} from 'ethers/providers';
import {BigNumber} from 'ethers/utils';
import {GNTDepositFactory, GolemNetworkTokenBatchingFactory, GolemNetworkTokenFactory, NewGolemNetworkTokenFactory} from 'gnt2-contracts';
import {ContractAddressService} from './ContractAddressService';
import {gasLimit} from '../config';
import {ContractTransaction} from 'ethers';
import {callEffectForEach, Property, State, withEffect, withSubscription} from 'reactive-properties';
import {ConnectionService} from './ConnectionService';

export enum DepositState {
  LOCKED, TIME_LOCKED, UNLOCKED, EMPTY
}

export type PossibleBalance = BigNumber | undefined;

export class TokensService {

  private gntBalanceState: State<PossibleBalance>;
  gntBalance: Property<PossibleBalance>;
  private gntbBalanceState: State<PossibleBalance>;
  gntbBalance: Property<PossibleBalance>;
  private ngntBalanceState: State<PossibleBalance>;
  ngntBalance: Property<PossibleBalance>;

  constructor(private provider: () => JsonRpcProvider, private contractAddressService: ContractAddressService, private connectionService: ConnectionService) {
    this.gntBalanceState = new State<PossibleBalance>(undefined);
    this.gntbBalanceState = new State<PossibleBalance>(undefined);
    this.ngntBalanceState = new State<PossibleBalance>(undefined);
    const contractAddresses = this.contractAddressService.contractAddresses;
    this.gntBalance = this.gntBalanceState
      .pipe(
        withSubscription(async () => {
          await this.updateGntBalance();
        }, contractAddresses),
        withSubscription(async () => {
          await this.updateGntBalance();
        }, this.connectionService.account),
        withEffect(() => contractAddresses.pipe(callEffectForEach(() => {
          const golemNetworkToken = this.gntContract();
          const filters = this.gntEventFilters();
          const callback = () => this.updateGntBalance();
          filters.forEach(filter => golemNetworkToken.addListener(filter, callback));
          return () => filters.forEach(filter => golemNetworkToken.removeListener(filter, callback));
        }))),
      );
    this.gntbBalance = this.gntbBalanceState
      .pipe(
        withSubscription(async () => {
          await this.updateGntbBalance();
        }, contractAddresses),
        withSubscription(async () => {
          await this.updateGntbBalance();
        }, this.connectionService.account),
        withEffect(() => contractAddresses.pipe(callEffectForEach(() => {
          const golemNetworkTokenBatching = this.gntbContract();
          const filters = this.gntbEventFilters();
          const callback = () => this.updateGntbBalance();
          filters.forEach(filter => golemNetworkTokenBatching.addListener(filter, callback));
          return () => filters.forEach(filter => golemNetworkTokenBatching.removeListener(filter, callback));
        })))
      );
    this.ngntBalance = this.ngntBalanceState
      .pipe(
        withSubscription(async () => {
          await this.updateNgntBalance();
        }, contractAddresses),
        withSubscription(async () => {
          await this.updateNgntBalance();
        }, this.connectionService.account),
        withEffect(() => contractAddresses.pipe(callEffectForEach(() => {
          const newGolemNetworkToken = this.ngntContract();
          const filters = this.ngntEventFilters();
          const callback = () => this.updateNgntBalance();
          filters.forEach(filter => newGolemNetworkToken.addListener(filter, callback));
          return () => filters.forEach(filter => newGolemNetworkToken.removeListener(filter, callback));
        })))
      );
  }

  private gntEventFilters() {
    const migrate = this.gntContract().filters.Migrate(this.account(), null, null);
    const transferFrom = this.gntContract().filters.Transfer(this.account(), null, null);
    const transferTo = this.gntContract().filters.Transfer(null, this.account(), null);
    return [migrate, transferFrom, transferTo];
  }

  private gntbEventFilters() {
    const transferFrom = this.gntbContract().filters.Transfer(this.account(), null, null);
    const transferTo = this.gntbContract().filters.Transfer(null, this.account(), null);
    const minted = this.gntbContract().filters.Minted(this.account(), null);
    const burned = this.gntbContract().filters.Burned(this.account(), null);
    return [transferFrom, transferTo, minted, burned];
  }

  private ngntEventFilters() {
    const transferFrom = this.ngntContract().filters.Transfer(this.account(), null, null);
    const transferTo = this.ngntContract().filters.Transfer(null, this.account(), null);
    return [transferFrom, transferTo];
  }

  private async updateGntBalance() {
    this.gntBalanceState.set(await this.balanceOfOldTokens(this.account()));
  }

  private async updateGntbBalance() {
    this.gntbBalanceState.set(await this.balanceOfBatchingTokens(this.account()));
  }

  private async updateNgntBalance() {
    this.ngntBalanceState.set(await this.balanceOfNewTokens(this.account()));
  }

  private account() {
    return this.connectionService.account.get();
  }

  tokenContractsAddresses() {
    return this.contractAddressService.contractAddresses.get();
  }

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
