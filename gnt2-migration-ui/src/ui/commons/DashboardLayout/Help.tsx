import React from 'react';
import styled from 'styled-components';
import {SectionTitle} from '../Text/SectionTitle';
import {Text} from '../Text/Text';
import triangle from '../../../assets/icons/triangle.svg';
import arrow from '../../../assets/icons/arrow.svg';

export const Help = () => (
  <HelpView>
    <HelpTitle>WATCH THIS BEFORE YOU GET STARTED</HelpTitle>
    <HelpText>Please watch this video - migrate in a safe and secure way!</HelpText>
    <VideoContainer>
      <Video>
        <PlatButton/>
      </Video>
    </VideoContainer>
    <HelpLink>Need more information? We got you covered.</HelpLink>
  </HelpView>
);

const HelpView = styled.div`
  display: block;
  max-width: 370px;
  margin-left: 30px;
  text-align: right;

  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    max-width: initial;
    margin: 50px 0 0;
    text-align: left;
  }
`;

const HelpTitle = styled(SectionTitle)`
  margin-bottom: 24px;
`;

const HelpText = styled(Text)`
  margin-bottom: 32px;
`;

const VideoContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Video = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 324px;
  height: 182px;
  margin: 0 0 62px auto;
  background: #EDEEFF;

  @media (max-width: 900px) {
    margin: 0 auto 62px 0;
  }

  @media (max-width: 350px) {
    margin: 0 0 62px 0;
    width: 203px;
    height: 114px;
  }
`;

const PlatButton = styled.button`
  width: 56px;
  height: 56px;
  background: url(${triangle}) center no-repeat;
  border-radius: 50%;
  border: 1px solid rgba(173, 176, 229, 0.3);
`;

const HelpLink = styled.a`
  font-family: AktivGroteskEx;
  position: relative;
  display: block;
  padding-right: 170px;
  font-weight: bold;
  font-size: 16px;
  line-height: 20px;
  text-align: right;
  color: #1722A2;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: 150px;
    height: 40px;
    background: url(${arrow}) center no-repeat;
  }
`;
