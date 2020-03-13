import React, {ReactNode} from 'react';
import styled from 'styled-components';
import logo from '../../../assets/logo.svg';
import {Help} from './Help';

export interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  backTo?: string;
}

export const DashboardLayout = ({title, backTo, children}: DashboardLayoutProps) => (
  <DashboardContainer>
    <Header>
      <img src={logo} alt="Golem logo"/>
      <PageName>GOLEM HOME</PageName>
    </Header>
    <Title>{title || 'GOLEM TOKEN MIGRATOR'}</Title>
    <Row>
      <div>
        {children}
      </div>
      <Help/>
    </Row>
  </DashboardContainer>
);

const DashboardContainer = styled.div`
  max-width: 1230px;
  margin: 0 auto;
  padding: 32px 30px 0; 
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 73px;
`;

const PageName = styled.p`
  font-weight: 300;
  font-size: 14px;
  line-height: 18px;
  text-align: right;
  letter-spacing: 2px;
  color: #1722A2;
`;

const Title = styled.p`
  position: relative;
  padding-left: 150px;
  margin-bottom: 56px;
  font-weight: 300;
  font-size: 12px;
  line-height: 15px;
  display: flex;
  align-items: center;
  letter-spacing: 2px;
  color: #1722A2;

  &::before {
    content: '';
    position: absolute;
    top: 6px;
    left: 0;
    width: 142px;
    height: 1px;
    background: #1722A2;
  } 
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;
