import React from 'react';
import styled from 'styled-components';
import {BigNumber} from 'ethers/utils';
import {formatTokenBalance} from '../../utils/formatter';
import {Amount, BalanceBlock, BalanceRow, Ticker} from './Balance';
import {tokens} from '../../domain/constants';
import {TitleWithTooltip} from '../commons/Text/TitleWithTooltip';

export interface NewTokensBalanceProps {
  balance: BigNumber | undefined;
}

export const NewTokensBalance = ({balance}: NewTokensBalanceProps) => (
  <View>
    <TitleWithTooltip
      tooltipText={
        `These are the new migrated tokens. If you have migrated to ${tokens.ngnt.ticker}, your whole balance shows as ${tokens.ngnt.ticker}.`
      }
    >
      {tokens.ngnt.name}
    </TitleWithTooltip>
    <Row>
      <TokenTicker>{tokens.ngnt.ticker}</TokenTicker>
      <TokenAmount data-testid="NGNT-balance">{formatTokenBalance(balance)}</TokenAmount>
    </Row>
  </View>
);

const View = styled(BalanceBlock)`
  padding-bottom: 36px;
  border: 1px solid #181EA9;
`;

const Row = styled(BalanceRow)`
  margin-top: 3px;
  max-width: 402px;

  @media(max-width: 900px) {
    max-width: initial;
    padding-right: 180px;
  }

  @media(max-width: 600px) {
    padding: 0;
  }
`;

const TokenTicker = styled(Ticker)`
  font-size: 20px;
  line-height: 26px;
`;

const TokenAmount = styled(Amount)`
  font-size: 24px;
  line-height: 28px;
`;
