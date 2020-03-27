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
    const updateEtherBalance = async () => state.set(await this.provider().getBalance(this.connectionService.address.get()));
    return state.pipe(
      withSubscription(updateEtherBalance, this.connectionService.account),
      withEffect(() => this.connectionService.account.pipe(
        callEffectForEach((account) => this.subscribeToBalanceChange(account.address, updateEtherGivenBalance))
      ))
    );
  }

  private subscribeToBalanceChange(address: string, callback: (balance: PossibleBalance) => void) {
    this.provider().on(address, (newBalance) => callback(newBalance));
    return () => this.provider().removeAllListeners(address);
  }
}
