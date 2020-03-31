import React from 'react';
import styled from 'styled-components';
import {useProperty} from './hooks/useProperty';
import {useServices} from './hooks/useServices';

export interface BlurModalProps {
  isVisible: boolean;
  className?: string;
}

export const BlurModal = ({isVisible, className}: BlurModalProps) => {
  const {connectionService} = useServices();
  const network = useProperty(connectionService.network);

  if (isVisible) {
    return (
      <ModalView data-testid="modal" className={className || ''}>
        <Title>Wrong Network</Title>
        <Text>You are on an unsupported network ({network}). Please switch to Ethereum Mainnet to migrate your tokens.</Text>
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
