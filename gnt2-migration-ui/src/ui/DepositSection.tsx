import React, {useState} from 'react';
import {BigNumber} from 'ethers/utils';
import {Balance} from './Balance';
import {DepositTimer} from './DepositTimer';
import {useAsync} from './hooks/useAsync';
import {useServices} from './useServices';
import {DepositState} from '../services/TokensService';
import {useAsyncEffect} from './hooks/useAsyncEffect';
import {CTAButton} from './commons/CTAButton';
import {useProperty} from './hooks/useProperty';

export function DepositSection() {
  const {tokensService, connectionService, contractAddressService} = useServices();

  const account = useProperty(connectionService.account);
  const contractAddresses = useProperty(contractAddressService.contractAddresses);

  const [depositLockState, setDepositLockState] = useState<DepositState>(DepositState.LOCKED);

  const [depositBalance] = useAsync(
    async () => tokensService.balanceOfDepositTokens(account),
    [contractAddresses, account, depositLockState]);

  useAsyncEffect(async () => {
    setDepositLockState(await tokensService.isDepositLocked(account));
  }, [account, tokensService]);

  function exists(balance: BigNumber | undefined) {
    return balance && !balance?.eq(0);
  }

  const unlockDeposit = async () => {
    await tokensService.unlockDeposit();
    setDepositLockState(DepositState.TIME_LOCKED);
  };

  if (!exists(depositBalance)) {
    return null;
  }

  return (
    <>
      <Balance testId='deposit' tokenName='deposit' balance={depositBalance}/>
      <DepositTimer/>
      <CTAButton
        data-testid="action-deposit-button"
        disabled={depositLockState === DepositState.TIME_LOCKED}
        onClick={() => unlockDeposit()}
      >
        {depositLockState === 0 ? 'Unlock' : 'Time lock'}
      </CTAButton>
    </>
  );
}
