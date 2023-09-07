import styled from 'styled-components';

export const CTAButton = styled.button`
  font-weight: 500;
  background-color: #fff;
  border: 1px solid #181EA9;
  color:#181EA9;
  padding: 10px 25px;
  min-width: 150px;
  margin: 12px 0;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  &:disabled {
    opacity: 0.3;
  }
`;
