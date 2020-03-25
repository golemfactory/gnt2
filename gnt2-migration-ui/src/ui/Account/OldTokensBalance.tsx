import React, {useEffect, useState} from 'react';
import {Amount, BalanceBlock, BalanceButton, BalanceRow, Ticker} from './Balance';
import {formatValue} from '../../utils/formatter';
import {BigNumber} from 'ethers/utils';
import {TitleWithTooltip} from '../commons/Text/TitleWithTooltip';
import {useProperty} from '../hooks/useProperty';
import {AddressZero} from 'ethers/constants';
import {useServices} from '../hooks/useServices';

interface OldTokensBalanceProps {
  balance: BigNumber | undefined;
  onConvert: () => void;
}

export const OldTokensBalance = ({balance, onConvert}: OldTokensBalanceProps) => {
  const {tokensService} = useServices();
  const [tooltipText, setTooltipText] = useState<string>('');
  const [isMigrationTargetSetToZero, setMigrationTargetSetToZero] = useState<boolean>(false);
  const migrationTarget = useProperty(tokensService.migrationTarget);

  useEffect(() => {
    const isTargetZero = migrationTarget === AddressZero;
    setMigrationTargetSetToZero(isTargetZero);
    if (isTargetZero) {
      setTooltipText('Migration Target is not set');
      return;
    }
    setTooltipText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vehicula vehicula odio, ut scelerisque massa.Learn more');
  }, [migrationTarget]);

  return (
    <BalanceBlock>
      <TitleWithTooltip
        tooltipText={<div data-testid='GNT-btn-tooltip'>{tooltipText}</div>}
      >
          Golem Network Tokens
      </TitleWithTooltip>
      <BalanceRow>
        <Ticker>GNT</Ticker>
        <Amount data-testid='GNT-balance'>{balance ? formatValue(balance.toString(), 3) : 0}</Amount>
        <BalanceButton
          data-testid='convert-button'
          onClick={onConvert}
          disabled={balance?.eq(new BigNumber('0')) || isMigrationTargetSetToZero}
        >
          Convert
        </BalanceButton>
      </BalanceRow>
    </BalanceBlock>
  );
};
