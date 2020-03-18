import React from 'react';
import styled from 'styled-components';

export interface WalletNameProps {
  icon: string;
  children: string;
}

export const WalletName = ({icon, children}: WalletNameProps) => (
  <WalletNameRow>
    <img src={icon}/>
    <WalletNameText>{children}</WalletNameText>
  </WalletNameRow>
);

const WalletNameRow = styled.div`
  display: flex;
  align-items: center;

  & + & {
    margin-left: 23px;
  }
`;

const WalletNameText = styled.p`
  margin-left: 10px;
  font-size: 14px;
  line-height: 16px;
  letter-spacing: 2px;
  color: #1722a2;
`;
