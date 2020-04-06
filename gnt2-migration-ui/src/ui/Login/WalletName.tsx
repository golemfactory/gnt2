import React from 'react';
import styled from 'styled-components';

export interface WalletNameProps {
  icon: string;
  children: string;
}

export const WalletName = ({icon, children}: WalletNameProps) => (
  <WalletNameRow>
    <img src={icon} alt='Wallet name'/>
    <WalletNameText>{children}</WalletNameText>
  </WalletNameRow>
);

const WalletNameRow = styled.div`
  display: flex;
  height: 14px;
`;

const WalletNameText = styled.p`
  margin-left: 3px;
  font-size: 14px;
  color: #181EA9;
  font-weight: bold;
`;
