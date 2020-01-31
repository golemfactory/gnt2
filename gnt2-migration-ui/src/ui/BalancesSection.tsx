import React from 'react';
import {BigNumber} from 'ethers/utils';
import {useAsync} from './hooks/useAsync';
import {Balance} from './Balance';
import {useServices} from './useServices';
import {useProperty} from './hooks/useProperty';

interface BalancesSectionProps {
  refreshTrigger: boolean;
  setGNTBalance: (value: BigNumber | undefined) => void;
}

export const BalancesSection = ({refreshTrigger, setGNTBalance}: BalancesSectionProps) => {
  const {tokensService, accountService, connectionService, contractAddressService} = useServices();
  const account = useProperty(connectionService.account);
  const contractAddresses = useProperty(contractAddressService.contractAddresses);

  const useAsyncBalance = (execute: () => Promise<BigNumber | undefined>) => useAsync(execute, [refreshTrigger, contractAddresses, account]);

  const [newTokensBalance] = useAsyncBalance(async () => tokensService.balanceOfNewTokens(account));
  const [oldTokensBalance] = useAsyncBalance(async () => tokensService.balanceOfOldTokens(account));
  const [batchingTokensBalance] = useAsyncBalance(async () => tokensService.balanceOfBatchingTokens(account));
  const [depositBalance] = useAsyncBalance(async () => tokensService.balanceOfDepositTokens(account));
  const [balance] = useAsyncBalance(async () => accountService.balanceOf(account));

  setGNTBalance(oldTokensBalance);

  return (<>
    <Balance testId='NGNT-balance' tokenName='NGNT' balance={newTokensBalance}/>
    <Balance testId='GNT-balance' tokenName='GNT' balance={oldTokensBalance}/>
    <Balance testId='GNTB-balance' tokenName='NGNB' balance={batchingTokensBalance}/>
    <Balance testId='deposit' tokenName='deposit' balance={depositBalance}/>
    <Balance testId='ETH-balance' tokenName='ETH' balance={balance} digits={4}/>
  </>);
};
