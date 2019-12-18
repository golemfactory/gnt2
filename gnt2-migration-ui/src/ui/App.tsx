import React, {useState} from 'react';
import '../styles/App.sass';
import {hot} from 'react-hot-loader/root';
import styled from 'styled-components';
import connectToMetaMask from '../services/MetamaskService';

const App: React.FC = () => {
  const [address, setAddress] = useState('<unknown>');
  const [balance, setBalance] = useState('<unknown>');

  const onClick = async () => {
    const account = await connectToMetaMask();
    if (account) {
      setAddress(account[0].toString());
      setBalance(account[1].toString());
    }
  };

  return (
    <Body>
      <MetaMaskButton onClick={onClick}>Connect me to MetaMask</MetaMaskButton>
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
