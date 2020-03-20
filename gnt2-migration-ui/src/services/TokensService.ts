import {JsonRpcProvider} from 'ethers/providers';
import {BigNumber, BigNumberish} from 'ethers/utils';
import {GNTDepositFactory, GolemNetworkTokenBatchingFactory, GolemNetworkTokenFactory, NewGolemNetworkTokenFactory} from 'gnt2-contracts';
import {ContractAddressService} from './ContractAddressService';
import {gasLimit} from '../config';
import {ContractTransaction} from 'ethers';
import {callEffectForEach, Property, State, withEffect, withSubscription} from 'reactive-properties';
import {ConnectionService} from './ConnectionService';
import {ContractUtils} from '../utils/contractUtils';

export enum DepositState {
  LOCKED, TIME_LOCKED, UNLOCKED, EMPTY
}

export type PossibleBalance = BigNumber | undefined;

export class TokensService {

  gntBalance: Property<PossibleBalance>;
  gntbBalance: Property<PossibleBalance>;
  ngntBalance: Property<PossibleBalance>;
  depositBalance: Property<PossibleBalance>;
  depositLockState: Property<DepositState>;

  constructor(private provider: () => JsonRpcProvider, private contractAddressService: ContractAddressService, private connectionService: ConnectionService) {
    this.gntBalance = this.createBalanceProperty(
      () => this.balanceOfOldTokens(this.account()),
      callback => ContractUtils.subscribeToEvents(
        this.gntContract(),
        this.gntEventFilters(),
        callback
      )
    );
    this.gntbBalance = this.createBalanceProperty(
      () => this.balanceOfBatchingTokens(this.account()),
      callback => ContractUtils.subscribeToEvents(
        this.gntbContract(),
        this.gntbEventFilters(),
        callback
      )
    );
    this.ngntBalance = this.createBalanceProperty(
      () => this.balanceOfNewTokens(this.account()),
      callback => ContractUtils.subscribeToEvents(
        this.ngntContract(),
        this.ngntEventFilters(),
        callback
      )
    );
    this.depositBalance = this.createBalanceProperty(
      () => this.balanceOfDeposit(this.account()),
      callback => ContractUtils.subscribeToEvents(
        this.gntDepositContract(),
        this.depositEventFilters(),
        callback
      )
    );
    this.depositLockState = this.createDepositLockStateProperty(
      callback => ContractUtils.subscribeToEvents(
        this.gntDepositContract(),
        this.depositLockStateEventFilters(),
        callback
      )
    );
  }


  private createDepositLockStateProperty(
    subscribeToEvents: (cb: () => void) => (() => void)
  ) {
    const contractAddresses = this.contractAddressService.contractAddresses;
    const state = new State<DepositState>(DepositState.LOCKED);
    const updateDepositLockState = async () =>
      this.safeContractRead(async () => state.set(await this.getDepositState(this.account())));

    return state.pipe(
      withSubscription(updateDepositLockState, contractAddresses),
      withSubscription(updateDepositLockState, this.connectionService.account),
      withEffect(() => contractAddresses.pipe(
        callEffectForEach(() => subscribeToEvents(updateDepositLockState))
      ))
    );
  }

  private createBalanceProperty(
    fetchBalance: () => Promise<BigNumber>,
    subscribeToEvents: (cb: () => void) => (() => void)
  ) {
    const contractAddresses = this.contractAddressService.contractAddresses;
    const state = new State<PossibleBalance>(undefined);
    const updateBalance = async () =>
      this.safeContractRead(async () => state.set(await fetchBalance()));

    return state.pipe(
      withSubscription(updateBalance, contractAddresses),
      withSubscription(updateBalance, this.connectionService.account),
      withEffect(() => contractAddresses.pipe(
        callEffectForEach(() => this.networkHasContracts() ? subscribeToEvents(updateBalance) : () => { /**/ })
      ))
    );
  }

  private safeContractRead(cb: () => void) {
    if (this.networkHasContracts()) {
      cb();
    }
  }

  private networkHasContracts() {
    return this.contractAddressService.hasContracts.get();
  }

  private depositLockStateEventFilters() {
    const lock = this.gntDepositContract().filters.Lock(this.account());
    const unlock = this.gntDepositContract().filters.Unlock(this.account());
    return [...this.depositEventFilters(), lock, unlock];
  }

  private depositEventFilters() {
    const deposit = this.gntDepositContract().filters.Deposit(this.account(), null);
    const withdrawFrom = this.gntDepositContract().filters.Withdraw(this.account(), null, null);
    const withdrawTo = this.gntDepositContract().filters.Withdraw(null, this.account(), null);
    const burn = this.gntDepositContract().filters.Burn(this.account(), null);
    return [deposit, withdrawFrom, withdrawTo, burn];
  }

  private gntEventFilters() {
    const migrate = this.gntContract().filters.Migrate(this.account(), null, null);
    return [...this.TransferEventFilters(), migrate];
  }

  private gntbEventFilters() {
    const minted = this.gntbContract().filters.Minted(this.account(), null);
    const burned = this.gntbContract().filters.Burned(this.account(), null);
    return [...this.TransferEventFilters(), minted, burned];
  }

  private ngntEventFilters() {
    return this.TransferEventFilters();
  }

  private TransferEventFilters() {
    const transferFrom = this.ngntContract().filters.Transfer(this.account(), null, null);
    const transferTo = this.ngntContract().filters.Transfer(null, this.account(), null);
    return [transferFrom, transferTo];
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

  async migrateTokens(address: string, value: BigNumberish): Promise<ContractTransaction> {
    return this.gntContractAsSigner(address).migrate(value, {gasLimit});
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
