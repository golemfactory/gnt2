import {Contract, EventFilter} from 'ethers';

export class ContractUtils {
  static subscribeToEvents(contract: Contract, filters: EventFilter[], callback: () => void): () => void {
    filters.forEach(filter => contract.addListener(filter, callback));
    return () => filters.forEach(filter => contract.removeListener(filter, callback));
  }
}
