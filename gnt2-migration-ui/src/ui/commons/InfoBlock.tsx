import React from 'react';
import styled from 'styled-components';
import infoIcon from '../../assets/icons/info.svg';

export interface InfoBlockProps {
  children: string;
}

export const InfoBlock = ({children}: InfoBlockProps) => (
  <Row>
    <Icon src={infoIcon} alt="info"/>
    <InfoText>{children}</InfoText>
  </Row>
);

const Row = styled.div`
  display: flex;
  align-items: flex-start;
`;

const Icon = styled.img`
  margin: 2px 12px 0 0;
`;

const InfoText = styled.p`
  max-width: 254px;
  font-size: 13px;
  line-height: 18px;
  color: #181EA9;
  opacity: 0.6;
`;
