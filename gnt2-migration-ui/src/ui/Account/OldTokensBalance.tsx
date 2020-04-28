import React, {useEffect, useState} from 'react';
import {Amount, BalanceBlock, BalanceButton, BalanceRow, Ticker} from './Balance';
import {formatTokenBalance} from '../../utils/formatter';
import {BigNumber} from 'ethers/utils';
import {TitleWithTooltip} from '../commons/Text/TitleWithTooltip';
import {useProperty} from '../hooks/useProperty';
import {useServices} from '../hooks/useServices';

interface OldTokensBalanceProps {
  balance: BigNumber | undefined;
  onConvert: () => void;
}

export const OldTokensBalance = ({balance, onConvert}: OldTokensBalanceProps) => {
  const {tokensService} = useServices();
  const [tooltipText, setTooltipText] = useState<string>('');
  const isMigrationTargetSetToZero = useProperty(tokensService.isMigrationTargetSetToZero);

  useEffect(() => {
    if (isMigrationTargetSetToZero) {
      setTooltipText('Migration is currently stopped. You won\'t be able to migrate your tokens.');
      return;
    }
    setTooltipText('Former Native Token from the Golem Network - the one you need to migrate');
  }, [isMigrationTargetSetToZero]);

  return (
    <BalanceBlock>
      <TitleWithTooltip
        tooltipText={<div data-testid='GNT-btn-tooltip'>{tooltipText}</div>}
      >
          Golem Network Tokens
      </TitleWithTooltip>
      <BalanceRow>
        <Ticker>GNT</Ticker>
        <Amount data-testid='GNT-balance'>{formatTokenBalance(balance)}</Amount>
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
