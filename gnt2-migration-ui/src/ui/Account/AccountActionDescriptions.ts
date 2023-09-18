import {BigNumber} from 'ethers/utils';

export type WithoutValueDescription = {
  title: string;
  subtitle: string;
  from: string;
  balance: BigNumber;
}

export type WithValueDescription = {
  title: string;
  from: string;
  to: string;
  balance: BigNumber;
}


export class DescribeAction {

  static unlock(depositBalance: BigNumber): WithoutValueDescription {
    return {
      title: 'Unlock deposit',
      subtitle: `Unlocking Concent Deposit`,
      from: 'GNTB',
      balance: depositBalance
    };
  }

  static withdraw(depositBalance: BigNumber): WithoutValueDescription {
    return {
      title: 'Move to wrapped',
      subtitle: 'Withdrawing tokens from Concent Deposit',
      from: 'GNTB',
      balance: depositBalance
    };
  }

  static migrate(gntBalance: BigNumber): WithValueDescription {
    return {
      title: 'Convert',
      from: 'GNT',
      to: 'GLM',
      balance: gntBalance
    };
  }

  static unwrap(gntbBalance: BigNumber): WithValueDescription {
    return {
      title: 'Convert',
      from: 'GNTB',
      to: 'GNT',
      balance: gntbBalance
    };
  }
}
