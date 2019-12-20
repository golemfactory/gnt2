import React from 'react';
import '../styles/App.sass';
import styled from 'styled-components';
import {useServices} from './useServices';
import {RouteComponentProps} from 'react-router-dom';

export const Login = ({history}: RouteComponentProps) => {
  const {connectionService} = useServices();

  const onClick = async () => {
    const provider = await connectionService.connect();
    console.log(provider);
    if (provider) {
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
