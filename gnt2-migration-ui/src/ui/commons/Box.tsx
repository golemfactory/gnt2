import styled from 'styled-components';
import {ButtonPrimary} from './Buttons/ButtonPrimary';
import {SectionTitle} from './Text/SectionTitle';
import {SmallTitle} from './Text/SmallTitle';

export const Box = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 457px;
  border: 1px solid #181EA9;
`;

export const BoxContent = styled.div`
  flex-grow: 1;
  padding: 40px 48px 70px;
  @media (max-width: 390px) {
    padding: 40px 24px 70px;
  }
`;

export const BoxTitle = styled(SectionTitle)`
  margin-bottom: 40px;
  text-align: center;
`;

export const BoxSubTitle = styled(SmallTitle)`
  border-bottom: 1px solid rgb(232, 232, 246);
`;

export const BoxRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
`;

export const BoxFooter = styled.div`
  border-top: 1px solid #181EA9;
  padding: 24px 48px;
  @media (max-width: 390px) {
    padding: 24px;
  }
`;

export const BoxFooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  @media (max-width: 390px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const BoxFooterButton = styled(ButtonPrimary)`
  max-width: 238px;
  width: 100%;
  @media (max-width: 390px) {
    width: 148px;
    margin-top: 12px;
  }
`;

export interface BoxFooterAmountProps {
  isError?: boolean;
}

export const BoxFooterAmount = styled.p<BoxFooterAmountProps>`
  font-family: Roboto Mono;
  font-weight: normal;
  margin-top: 3px;
  font-size: 14px;
  line-height: 16px;
  color: ${({isError}) => isError ? '#EC0505' : '#1722A2'};
`;
