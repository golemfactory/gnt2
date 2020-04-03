import React from 'react';
import {BigNumber} from 'ethers/utils';
import {BalanceBlock, BalanceRow, Ticker, Amount} from './Balance';
import styled from 'styled-components';
import {formatValue} from '../../utils/formatter';
import {TitleWithTooltip} from '../commons/Text/TitleWithTooltip';

interface EthereumBalanceProps {
  balance: BigNumber | undefined;
}

export const EthereumBalance = ({balance}: EthereumBalanceProps) => (
  <EthereumBalanceBlock>
    <TitleWithTooltip
      tooltipText="Remember: you need ETH to pay for gas, otherwise the migration will not be effective."
    >
      ETH Balance
    </TitleWithTooltip>
    <Row>
      <Ticker>ETH</Ticker>
      <Amount data-testid="ETH-balance">{balance && formatValue(balance, 4)}</Amount>
    </Row>
  </EthereumBalanceBlock>
);

const EthereumBalanceBlock = styled(BalanceBlock)`
  border: none;
`;

const Row = styled(BalanceRow)`
  max-width: 402px;
  margin-top: 4px;
`;
