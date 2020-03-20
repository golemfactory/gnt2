import React from 'react';
import {Box, BoxContent, BoxFooter, BoxTitle, BoxSubTitle, BoxRow, BoxFooterRow, BoxFooterAmount, BoxFooterButton} from '../commons/Box';
import {Ticker} from './Balance';
import styled from 'styled-components';
import {TitleWithTooltip} from '../commons/Text/TitleWithTooltip';
import {CancelButton} from '../commons/Buttons/CancelButton';

export const MoveToWrapped = () => {

  return (
    <>
      <Box>
        <BoxContent>
          <BoxTitle>Move to wrapped</BoxTitle>
          <BoxSubTitle>Withdrawing form deposit</BoxSubTitle>
          <BoxRow>
            <Ticker>GNTb</Ticker>
            <Amount>3459284,24561245</Amount>
          </BoxRow>
        </BoxContent>
        <BoxFooter>
          <BoxFooterRow>
            <div>
              <TitleWithTooltip
                tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vehicula vehicula odio, ut scelerisque massa.Learn more"
              >
                ETH Balance:
              </TitleWithTooltip>
              <BoxFooterAmount>1,24561245 ETH</BoxFooterAmount>
            </div>
            <BoxFooterButton>Confirm Transaction</BoxFooterButton>
          </BoxFooterRow>
        </BoxFooter>
      </Box>
      <CancelButton>Cancel</CancelButton>
    </>
  );
};

const Amount = styled.p`
  font-size: 18px;
  line-height: 21px;
  text-align: right;
  color: #1722A2;
`;
