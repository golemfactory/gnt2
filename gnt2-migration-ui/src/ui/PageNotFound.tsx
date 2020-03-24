import React from 'react';
import styled from 'styled-components';
import pageNotFound from '../assets/icons/404.svg';
import logo from '../assets/logo.svg';
import arrowBack from '../assets/icons/arrow-back.svg';
import {RouteComponentProps} from 'react-router-dom';
import { Footer } from './Footer';

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
            <img src={pageNotFound}/>
            <Text>Sorry we can&apos;t find that page. Either something went wrong or the page doesn&apos;t exist anymore.</Text>
            <Back onClick={() => history.goBack()}>
              <Arrow src={arrowBack}/>
              Back
            </Back>
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
  width: 421px;
  display: block;
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

const Back = styled.button`
  width: 50px;
  margin: 0 auto;
  font-weight: 300;
  font-size: 12px;
  line-height: 15px;
  display: flex;
  align-items: center;
  letter-spacing: 2.57143px;
  color: #1722A2;
  text-decoration: none;
`;

const Arrow = styled.img`
  width: 20px;
  height: 6px;
  margin-bottom: 3px;
  transform: rotate(90deg);
`;
