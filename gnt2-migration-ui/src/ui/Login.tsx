import React from 'react';
import styled from 'styled-components';
import {useServices} from './hooks/useServices';
import {RouteComponentProps} from 'react-router-dom';
import {ConnectionState} from '../services/ConnectionService';

export const Login = ({history}: RouteComponentProps) => {
  const {connectionService} = useServices();

  const onClick = async () => {
    await connectionService.connect();
    if (connectionService.connectionState === ConnectionState.CONNECTED) {
      history.push('/account');
    }
  };

  return (
    <MetaMaskButton onClick={onClick}>Connect with MetaMask</MetaMaskButton>
  );
};

const MetaMaskButton = styled.button`
  background-color: #f59042;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  border-radius: 8px;
`;
