import React from 'react';
import styled from 'styled-components';
import {SectionTitle} from '../Text/SectionTitle';
import {Text} from '../Text/Text';
import triangle from '../../../assets/icons/triangle.svg';
import arrow from '../../../assets/icons/arrow.svg';

export const Help = () => (
  <HelpView>
    <HelpTitle>Need some help?</HelpTitle>
    <HelpText>Check some tips and tutorials on how to migrate your tokens in a safe and secure way.</HelpText>
    <Video>
      <PlatButton/>
    </Video>
    <HelpLink>Text guides</HelpLink>
  </HelpView>
);

const HelpView = styled.div`
  max-width: 370px;
  margin-left: 30px;
  text-align: right;
`;

const HelpTitle = styled(SectionTitle)`
  margin-bottom: 24px;
`;

const HelpText = styled(Text)`
  margin-bottom: 32px;
`;

const Video = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 270px;
  height: 152px;
  margin: 0 0 62px auto;
  background: #EDEEFF;
`;

const PlatButton = styled.button`
  width: 56px;
  height: 56px;
  background: url(${triangle}) center no-repeat;
  border-radius: 50%;
  border: 1px solid rgba(173, 176, 229, 0.3);
`;

const HelpLink = styled.a`
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
