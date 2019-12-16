import React from 'react';
import logo from '../assets/logo.svg';
import '../styles/App.sass';
import {hot} from 'react-hot-loader/root';
import styled from 'styled-components';

const App: React.FC = () => {
  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo'/>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <StyledLink
          href='https://reactjs.org'
          target='_blank'
          rel='noopener noreferrer'
        >
          Learn React
        </StyledLink>
      </header>
    </div>
  );
};

export const StyledLink = styled.a`
    color: #09d3ac
`;

export default hot(App);
