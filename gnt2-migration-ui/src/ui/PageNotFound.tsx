import React from 'react';
import styled from 'styled-components';
import pageNotFound from '../assets/icons/404.svg';
import logo from '../assets/logo.svg';
import {RouteComponentProps} from 'react-router-dom';
import {Footer} from './Footer';
import {BackButton} from './commons/Buttons/BackButton';

export function PageNotFound({history}: RouteComponentProps) {
  return (
    <>
      <DashboardContainer>
        <Header>
          <img src={logo} alt="Golem logo"/>
          <PageName>GOLEM HOME</PageName>
        </Header>
        <PageContainer>
          <CenterContainer>
            <img src={pageNotFound} alt='Page not found'/>
            <Text>Sorry we can&apos;t find that page. Either something went wrong or the page doesn&apos;t exist anymore.</Text>
            <Back onClick={() => history.goBack()}>Back</Back>
          </CenterContainer>
        </PageContainer>
      </DashboardContainer>
      <Footer/>
    </>
  );
}

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

const PageName = styled.p`
  font-weight: 300;
  font-size: 14px;
  line-height: 18px;
  text-align: right;
  letter-spacing: 2px;
  color: #1722A2;
`;

const CenterContainer = styled.div`
  margin: 0 auto;
  max-width: 421px;
  display: block;

  & img {
    max-width: 100%;
  }
`;

const PageContainer = styled.div`
  width: 100%;
`;

const Text = styled.p`
  font-size: 18px;
  line-height: 30px;
  text-align: center;
  color: #1722A2;
  opacity: 0.6;
  margin-bottom: 100px;
`;

const Back = styled(BackButton)`
  display: block;
  margin: 0 auto;
`;
