import React from 'react';
import {BigNumber} from 'ethers/utils';
import {useAsync} from '../hooks/useAsync';
import {useServices} from '../hooks/useServices';
import {useProperty} from '../hooks/useProperty';
import {DepositSection} from '../DepositSection';
import {BatchingTokensSection} from '../BatchingTokensSection';
import {NewTokensBalance} from './NewTokensBalance';
import {OldTokensBalance} from './OldTokensBalance';
import {EthereumBalance} from './EthereumBalance';

interface BalancesSectionProps {
  onConvert: () => void;
  onUnwrap: () => void;
  onMoveToWrapped: () => void;
  onUnlock: () => void;
}

export const BalancesSection = ({onConvert, onMoveToWrapped, onUnlock, onUnwrap}: BalancesSectionProps) => {
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
      <NewTokensBalance balance={newTokensBalance}/>
      <OldTokensBalance balance={oldTokensBalance} onConvert={onConvert}/>
      <BatchingTokensSection onUnwrap={onUnwrap}/>
      <DepositSection onMoveToWrapped={onMoveToWrapped} onUnlock={onUnlock}/>
      <EthereumBalance balance={balance}/>
    </>
  );
};
