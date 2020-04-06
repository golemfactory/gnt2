import React from 'react';
import styled from 'styled-components';

export interface BlurModalProps {
  isVisible: boolean;
  className?: string;
  dataTestId?: string;
  title: string;
  body: string;
}

export const BlurModal = ({
  isVisible,
  className,
  dataTestId = 'modal',
  title,
  body
}: BlurModalProps) => {
  if (isVisible) {
    return (
      <ModalView data-testid={dataTestId} className={className || ''}>
        <Title>{title}</Title>
        <Text>{body}</Text>
      </ModalView>
    );
  } else return null;

};

const ModalView = styled.div`
  position: absolute;
  top: 66px;
  left: 50%;
  padding: 40px;
  max-width: 480px;
  width: 100%;
  min-height: 296px;
  transform: translateX(-50%);
  background: #FFFFFF;
  border: 1px solid #181EA9;
`;

const Title = styled.h1`
  font-family: AktivGroteskEx;
  text-align: center;
  font-weight: bold;
  font-size: 24px;
  line-height: 31px;
  color: #181EA9;
  margin-bottom: 40px;
`;


const Text = styled.p`
  font-weight: 300;
  font-size: 18px;
  line-height: 30px;
  text-align: center;
  color: #1722A2;
  opacity: 0.6;
`;
