import {State} from 'reactive-properties';

export class RefreshService {
  refreshTrigger: State<boolean>;

  constructor() {
    this.refreshTrigger = new State<boolean>(false);
  }

  refresh() {
    this.refreshTrigger.set(!this.refreshTrigger.get());
  }
}
