import React from 'react';
import styled from 'styled-components';

export interface BlurModalProps {
  isVisible: boolean;
  className?: string;
}

export const BlurModal = ({isVisible, className}: BlurModalProps) => {

  if (isVisible) {
    return (
      <ModalView data-testid="modal" className={className || ''}>
        <Title>Wrong Network</Title>
        <Text>You are on the {'Kovan'} network. Pleae lorem ipsum dolor sit amet enim. Lorem ipsum dolor sit amet enim.</Text>
      </ModalView>
    );
  } else return null;

};

const ModalView = styled.div`
  position: relative;
  padding: 40px;
  width: 60%;
  height: 296px;
  transform: translateY(-30%);
  margin: 0 auto;
  background: #FFFFFF;
  border: 1px solid #181EA9;
`;

const Title = styled.h1`
  text-align: center;
  font-weight: bold;
  font-size: 24px;
  line-height: 31px;
  color: #181EA9;
  margin-bottom: 40px;
`;


const Text = styled.p`
  font-size: 18px;
  line-height: 30px;
  text-align: center;
  color: #1722A2;
  opacity: 0.6;
`;
