import React from 'react';
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
  const {tokensService, etherService} = useServices();

  const newTokensBalance = useProperty(tokensService.ngntBalance);
  const oldTokensBalance = useProperty(tokensService.gntBalance);
  const balance = useProperty(etherService.etherBalance);

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
