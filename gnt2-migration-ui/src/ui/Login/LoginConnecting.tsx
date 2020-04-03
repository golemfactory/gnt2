import React from 'react';
import metamaskIcon from '../../assets/icons/metamask.svg';
import styled from 'styled-components';
import {Spinner} from '../commons/Spinner';
import {SectionTitle} from '../commons/Text/SectionTitle';

export const LoginConnecting = () => (
  <>
    <Spinner/>
    <Row>
      <SectionTitle>Connecting to:</SectionTitle>
      <WalletNameWrapper>
        <MetamaskIcon src={metamaskIcon}/>
        <WalletName>Metamask</WalletName>
      </WalletNameWrapper>
    </Row>
  </>
);

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const WalletNameWrapper = styled.div`
  display: flex;
  align-items: center;

  @media (min-width: 350px) {
    margin-left: 25px;
  }
`;

const MetamaskIcon = styled.img`
  width: 40px;
  margin-right: 16px;
`;

const WalletName = styled.p`
  font-size: 14px;
  line-height: 16px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #1722A2;
`;
