import styled from 'styled-components';
import triangle from '../../../assets/icons/triangle-border.svg';

export const BackButton = styled.button`
  position: relative;
  padding: 0 0 0 18px;
  font-weight: 300;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: 2.57143px;
  color: #1722A2;
  border: none;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 6px;
    height: 17px;
    background: url(${triangle}) center no-repeat;
    background-size: contain;
  }
`;
