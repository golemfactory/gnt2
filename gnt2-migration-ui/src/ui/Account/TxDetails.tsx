import React from 'react';
import {Box, BoxContent, BoxRow, BoxSubTitle, BoxTitle} from '../commons/Box';
import {Ticker} from './Balance';
import styled from 'styled-components';
import {CancelButton} from '../commons/Buttons/CancelButton';
import {formatTokenBalance} from '../../utils/formatter';
import {WithoutValueDescription} from './AccountActionDescriptions';
import {BoxFooterContainer} from '../BoxFooterContainer';

interface TxDetailsProps {
  onCancelClick: () => void;
  onConfirm: () => void;
  description: WithoutValueDescription;
}

export const TxDetails = ({onCancelClick, onConfirm, description}: TxDetailsProps) =>
  <>
    <Box>
      <BoxContent>
        <BoxTitle>{description.title}</BoxTitle>
        <BoxSubTitle>{description.subtitle}</BoxSubTitle>
        <BoxRow>
          <Ticker>{description.from}</Ticker>
          <Amount>{formatTokenBalance(description.balance)}</Amount>
        </BoxRow>
      </BoxContent>
      <BoxFooterContainer onConfirmClick={onConfirm}/>
    </Box>
    <CancelButton onClick={onCancelClick}>Cancel</CancelButton>
  </>;

const Amount = styled.p`
  font-family: Roboto Mono;
  font-weight: normal;
  font-size: 18px;
  line-height: 21px;
  text-align: right;
  color: #1722A2;
`;
