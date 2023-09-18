import React, {ReactNode} from 'react';
import styled from 'styled-components';
import logo from '../../../assets/logo.svg';

import {Help} from './Help';
import {BlockTitle} from '../Text/BlockTitle';
import {Footer} from '../../Footer';
import {BackButton} from '../Buttons/BackButton';

export interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  backTo?: () => void;
}

export const DashboardLayout = ({title, backTo, children}: DashboardLayoutProps) => {
  return (
    <>
      <DashboardContainer>
        <Header>
          <LogoWithBackButton>
            <img src={logo} alt="Golem logo"/>
            {backTo && <BackButton onClick={backTo}/>}
          </LogoWithBackButton>
          <PageName href="http://golem.network/" target='_blank' rel="noopener noreferrer">
            GOLEM HOME
          </PageName>
        </Header>
        <Title>{title || 'GOLEM TOKEN MIGRATOR'}</Title>
        <Row>
          <DashboardContent>
            {children}
          </DashboardContent>
          <Help/>
        </Row>
      </DashboardContainer>
      <Footer/>
    </>
  );
};

const DashboardContainer = styled.div`
  max-width: 1230px;
  margin: 0 auto;
  padding: 32px 30px 100px;

  @media(max-width: 600px) {
    padding: 32px 15px 100px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 73px;
`;

const PageName = styled.a`
  font-weight: 300;
  font-size: 14px;
  line-height: 18px;
  text-align: right;
  letter-spacing: 2px;
  color: #1722A2;
  text-decoration: none;
`;

const Title = styled(BlockTitle)`
  position: relative;
  padding-left: 150px;
  margin-bottom: 56px;
  display: flex;
  align-items: center;

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
  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const DashboardContent = styled.div`
  width: 100%;
  @media(min-width: 900px) {
    width: 60%;
  }
`;

const LogoWithBackButton = styled.div`
  display: flex;
`;
