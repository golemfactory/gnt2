import React from 'react';
import styled from 'styled-components';
import {TooltipProps, Tooltip} from '../Tooltip';
import {SmallTitle} from './SmallTitle';

export interface TitleWithTooltip extends TooltipProps {
  children: string;
}

export const TitleWithTooltip = ({children, tooltipText}: TitleWithTooltip) => (
  <Row>
    <Title>{children}</Title>
    <Tooltip tooltipText={tooltipText}/>
  </Row>
);

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled(SmallTitle)`
  margin-right: 8px;
`;
