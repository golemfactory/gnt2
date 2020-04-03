import React from 'react';
import styled from 'styled-components';
import {SmallTitle} from '../commons/Text/SmallTitle';
import {BigNumber} from 'ethers/utils';
import {formatValue} from '../../utils/formatter';
import {BalanceBlock, BalanceRow, Amount, Ticker} from './Balance';
import {tokens} from '../../domain/constants';

export interface NewTokensBalanceProps {
  balance: BigNumber | undefined;
}

export const NewTokensBalance = ({balance}: NewTokensBalanceProps) => (
  <View>
    <SmallTitle>{tokens.ngnt.name}</SmallTitle>
    <Row>
      <TokenTicker>{tokens.ngnt.ticker}</TokenTicker>
      <TokenAmount data-testid="NGNT-balance">{balance ? formatValue(balance.toString(), 3) : 0}</TokenAmount>
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
