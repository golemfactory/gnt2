import React, {useState} from 'react';
import '../styles/App.sass';
import {hot} from 'react-hot-loader/root';
import styled from 'styled-components';
import {useServices} from './hooks';

const App: React.FC = () => {
  const [address, setAddress] = useState('<unknown>');
  const [balance, setBalance] = useState('<unknown>');
  const {connectionService, accountService} = useServices();

  const onClick = async () => {
    await connectionService.connect();
    const account = await accountService.getDefaultAccount();
    setAddress(account);
    const balance = (await accountService.balanceOf(account)).toString();
    setBalance(balance || '');
  };

  return (
    <Body>
      <MetaMaskButton onClick={onClick}>Connect with MetaMask</MetaMaskButton>
      <div>Your address:</div>
      <div>{address}</div>
      <div>Your balance:</div>
      <div>{balance}</div>
    </Body>
  );
};

const Body = styled.div`
    display: flex;
    flex-direction: column; 
    justify-content: center; 
    align-items: center;     
    height: 300px;
`;

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

export default hot(App);
