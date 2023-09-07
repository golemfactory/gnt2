import styled from 'styled-components';
import {ButtonPrimary} from '../commons/Buttons/ButtonPrimary';

export const BalanceBlock = styled.div`
  padding: 24px 24px 32px;
  border-bottom: 1px solid rgb(232, 232, 246);

  @media (max-width: 600px) {
    padding: 24px 10px 32px;
  }
`;

export const BalanceRow = styled.div`
  display: flex;
  align-items: center;

  @media(max-width: 600px) {
    flex-wrap: wrap;
  }
`;

export const Ticker = styled.p`
  font-family: AktivGroteskEx;
  font-weight: bold;
  font-size: 13px;
  line-height: 17px;
  letter-spacing: 1px;
  color: #1722A2;
`;

export const Amount = styled.p`
  font-family: Roboto Mono;
  font-weight: normal;
  margin-left: auto;
  font-size: 18px;
  line-height: 21px;
  text-align: right;
  color: #1722A2;
`;

export const BalanceButton = styled(ButtonPrimary)`
  margin-left: 32px;

  @media(max-width: 600px) {
    width: 100%;
    margin: 15px 0 0;
  }
`;
