import styled from 'styled-components';
import {ButtonPrimary} from '../commons/Buttons/ButtonPrimary';

export const BalanceBlock = styled.div`
  padding: 24px 24px 32px;
  border-bottom: 1px solid rgb(232, 232, 246);
`;

export const BalanceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Ticker = styled.p`
  font-weight: bold;
  font-size: 13px;
  line-height: 17px;
  letter-spacing: 1px;
  color: #1722A2;
`;

export const Amount = styled.p`
  font-size: 18px;
  line-height: 21px;
  text-align: right;
  color: #1722A2;
`;

export const AmountWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const BalanceButton = styled(ButtonPrimary)`
  margin-left: 32px;
`;
