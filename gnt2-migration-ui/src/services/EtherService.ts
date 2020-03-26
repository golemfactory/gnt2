import {JsonRpcProvider} from 'ethers/providers';
import {PossibleBalance} from '../domain/PossibleBalance';
import {callEffectForEach, Property, State, withEffect, withSubscription} from 'reactive-properties';
import {ConnectionService} from './ConnectionService';

export class EtherService {

  etherBalance: Property<PossibleBalance>;

  constructor(private provider: () => JsonRpcProvider, private connectionService: ConnectionService) {
    this.etherBalance = this.createEtherBalanceProperty();
  }

  private createEtherBalanceProperty() {
    const state = new State<PossibleBalance>(undefined);
    const updateEtherGivenBalance = (balance: PossibleBalance) => state.set(balance);
    const updateEtherBalance = async () => state.set(await this.provider().getBalance(this.connectionService.account.get()));
    return state.pipe(
      withSubscription(updateEtherBalance, this.connectionService.account),
      withSubscription(updateEtherBalance, this.connectionService.network),
      withEffect(() => this.connectionService.network.pipe(
        callEffectForEach(() => this.subscribeToBalanceChange(updateEtherGivenBalance))
      ))
    );
  }

  private subscribeToBalanceChange(callback: (balance: PossibleBalance) => void) {
    const account = this.connectionService.account.get();
    this.provider().on(account, (newBalance) => callback(newBalance));
    return () => this.provider().removeAllListeners(account);
  }
}
