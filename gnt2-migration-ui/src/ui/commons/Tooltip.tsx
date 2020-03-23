import React from 'react';
import infoIcon from '../../assets/icons/info.svg';
import styled from 'styled-components';

export interface TooltipProps {
  tooltipText: string | JSX.Element;
}

export const Tooltip = ({tooltipText}: TooltipProps) => (
  <TooltipWrapper>
    <img src={infoIcon} alt="info"/>
    <TooltipBody>{tooltipText}</TooltipBody>
  </TooltipWrapper>
);

const TooltipBody = styled.div`
  display: none;
  position: absolute;
  left: -8px;
  bottom: -13px;
  transform: translateY(100%);
  width: 284px;
  padding: 19px 16px 12px;
  background: rgb(237, 238, 255);
  border-radius: 4px;
  font-size: 12px;
  line-height: 18px;
  color: rgb(109, 113, 203);
  z-index: 10;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 9px;
    width: 0;
    height: 0;
    transform: translateY(-100%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid rgb(237, 238, 255);
  }
`;

const TooltipWrapper = styled.div`
  position: relative;

  &:hover ${TooltipBody} {
    display: block;
  }
`;
