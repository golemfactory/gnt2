import React from 'react';
import {BigNumber} from 'ethers/utils';
import {Amount, BalanceBlock, BalanceRow, Ticker} from './Balance';
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
      <ActionBox/>
    </Row>
  </EthereumBalanceBlock>
);

const EthereumBalanceBlock = styled(BalanceBlock)`
  border: none;
`;

const Row = styled(BalanceRow)`
  margin-top: 4px;
`;

const ActionBox = styled.div`
  width: 148px;
  height: 40px;
  margin-left: 32px;

  @media (max-width: 340px) {
    width: 100px;
  }

  @media(max-width: 600px) {
    width: 100%;
    margin: 15px 0 0;
  }
`;
