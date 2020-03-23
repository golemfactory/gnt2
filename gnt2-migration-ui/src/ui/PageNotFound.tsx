import {Link} from 'react-router-dom';
import React from 'react';
import styled from 'styled-components';
import {ButtonPrimary} from './commons/Buttons/ButtonPrimary';
import {SectionTitle} from './commons/Text/SectionTitle';
import {MainTitle} from './commons/Text/MainTitle';

export const PageNotFound = () => {
  return (
    <View>
      <MainTitle>404</MainTitle>
      <BoxTitle>Page Not Found</BoxTitle>
      <Link to="/">
        <NavigationButton>Go Back to Dashboard</NavigationButton>
      </Link>
    </View>
  );
};

const View = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
`;

export const BoxTitle = styled(SectionTitle)`
  margin-bottom: 40px;
  text-align: center;
`;

const NavigationButton = styled(ButtonPrimary)`
  max-width: 238px;
  width: 100%;
`;
