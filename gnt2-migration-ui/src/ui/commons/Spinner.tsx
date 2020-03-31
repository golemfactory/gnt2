import React from 'react';
import styled from 'styled-components';

export const Spinner = () => (
  <Loader/>
);

const Loader = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  margin: 1.5rem auto;
  border-radius: 50%;
  border: 0.3rem solid #181EA9;
  border-top-color: #FFFFFF;
  animation: 1.5s spin infinite linear;

  &.multi {
    border-bottom-color: #FFFFFF;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
