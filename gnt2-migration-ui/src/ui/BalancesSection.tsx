import React from 'react';
import {BigNumber} from 'ethers/utils';
import {useAsync} from './hooks/useAsync';
import {Balance} from './Balance';
import {useServices} from './hooks/useServices';
import {useProperty} from './hooks/useProperty';
import {DepositSection} from './DepositSection';
import {BatchingTokensSection} from './BatchingTokensSection';

export const BalancesSection = () => {
  const {tokensService, accountService, connectionService, contractAddressService, refreshService} = useServices();
  const account = useProperty(connectionService.account);
  const contractAddresses = useProperty(contractAddressService.contractAddresses);
  const refreshTrigger = useProperty(refreshService.refreshTrigger);
  const useAsyncBalance = (execute: () => Promise<BigNumber | undefined>) => useAsync(execute, [refreshTrigger, contractAddresses, account]);

  const newTokensBalance = useProperty(tokensService.ngntBalance);
  const oldTokensBalance = useProperty(tokensService.gntBalance);
  const [balance] = useAsyncBalance(async () => accountService.balanceOf(account));

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
