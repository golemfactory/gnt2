import React from 'react';
import {BigNumber} from 'ethers/utils';
import {useAsync} from './hooks/useAsync';
import {Balance} from './Balance';
import {useServices} from './hooks/useServices';
import {useProperty} from './hooks/useProperty';
import {DepositSection} from './DepositSection';
import {BatchingTokensSection} from './BatchingTokensSection';

interface BalancesSectionProps {
  setGNTBalance: (value: BigNumber | undefined) => void;
}

export const BalancesSection = ({setGNTBalance}: BalancesSectionProps) => {
  const {tokensService, accountService, connectionService, contractAddressService, refreshService} = useServices();
  const account = useProperty(connectionService.account);
  const contractAddresses = useProperty(contractAddressService.contractAddresses);
  const refreshTrigger = useProperty(refreshService.refreshTrigger);
  const useAsyncBalance = (execute: () => Promise<BigNumber | undefined>) => useAsync(execute, [refreshTrigger, contractAddresses, account]);

  const [newTokensBalance] = useAsyncBalance(async () => tokensService.balanceOfNewTokens(account));
  const oldTokensBalance = useProperty(tokensService.gntBalance);
  const [balance] = useAsyncBalance(async () => accountService.balanceOf(account));

  setGNTBalance(oldTokensBalance);

  return (
    <>
      <Balance testId='NGNT-balance' tokenName='NGNT' balance={newTokensBalance}/>
      <Balance testId='GNT-balance' tokenName='GNT' balance={oldTokensBalance}/>
      <BatchingTokensSection/>
      <DepositSection/>
      <Balance testId='ETH-balance' tokenName='ETH' balance={balance} digits={4}/>
    </>
  );
};
