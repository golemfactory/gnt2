import styled from 'styled-components';

export const CTAButton = styled.button`
  background-color: #181EA9;
  border: none;
  color: white;
  padding: 15px 32px;
  margin: 12px 0;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  border-radius: 8px;
  &:disabled {
    opacity: 0.3;
    background: grey;
  }
`;
