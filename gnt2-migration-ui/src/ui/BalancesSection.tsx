import React from 'react';
import {BigNumber} from 'ethers/utils';
import {useAsync} from './hooks/useAsync';
import {Balance} from './Balance';
import {useServices} from './useServices';
import {useProperty} from './hooks/useProperty';
import {ContractAddresses} from '../config';

interface BalancesSectionProps {
  deps: (string | boolean | ContractAddresses)[];
  setGNTBalance: (value: BigNumber | undefined) => void;
}

export const BalancesSection = ({deps, setGNTBalance}: BalancesSectionProps) => {
  const {tokensService, accountService, connectionService} = useServices();
  const account = useProperty(connectionService.account);

  const useAsyncBalance = (execute: () => Promise<BigNumber | undefined>) => useAsync(execute, deps);

  const [newTokensBalance] = useAsyncBalance(async () => tokensService.balanceOfNewTokens(account));
  const [oldTokensBalance] = useAsyncBalance(async () => tokensService.balanceOfOldTokens(account));
  setGNTBalance(oldTokensBalance);
  const [batchingTokensBalance] = useAsyncBalance(async () => tokensService.balanceOfBatchingTokens(account));
  const [depositBalance] = useAsyncBalance(async () => tokensService.balanceOfDepositTokens(account));
  const [balance] = useAsyncBalance(async () => accountService.balanceOf(account));

  return (<>
    <Balance testId='NGNT-balance' tokenName='NGNT' balance={newTokensBalance}/>
    <Balance testId='GNT-balance' tokenName='GNT' balance={oldTokensBalance}/>
    <Balance testId='GNTB-balance' tokenName='NGNB' balance={batchingTokensBalance}/>
    <Balance testId='deposit' tokenName='deposit' balance={depositBalance}/>
    <Balance testId='ETH-balance' tokenName='ETH' balance={balance} digits={4}/>
  </>);
};
