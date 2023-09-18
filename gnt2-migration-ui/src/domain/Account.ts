import {NetworkName} from './Network';

export class Account {
  constructor(readonly network: NetworkName, readonly address: string) {
  }
}
