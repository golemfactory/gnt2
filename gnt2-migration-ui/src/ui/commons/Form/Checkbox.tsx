import React, {ReactNode} from 'react';
import styled from 'styled-components';
import checkmark from '../../../assets/icons/checkmark.svg';

export interface CheckboxProps {
  value: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
}

export const Checkbox = ({children, value, onChange}: CheckboxProps) => (
  <CheckboxContainer>
    <ClickableContainer onClick={() => onChange(!value)}>
      <HiddenCheckbox onChange={() => onChange(!value)} checked={value}/>
      <StyledCheckbox/>
      <CheckboxLabel>{children}</CheckboxLabel>
    </ClickableContainer>
  </CheckboxContainer>
);

const CheckboxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

const ClickableContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const HiddenCheckbox = styled.input.attrs({type: 'checkbox'})`
  position: absolute;
  height: 0;
  z-index: -1;
  opacity: 0;
  margin: 10px 0 0 20px;
`;

const StyledCheckbox = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  background-color: #fff;
  background-image: url(${checkmark});
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid #cfd4e9;
  border-radius: 4px;

  ${HiddenCheckbox}:checked ~ & {
    background-color: #181EA9;
    background-image: url(${checkmark});
    border-color: #181EA9;
  }
`;
const CheckboxLabel = styled.p`
  display: flex;
  flex-wrap: wrap;
  font-size: 14px;
  line-height: 17px;
  color: #181EA9;
  opacity: 0.6;
`;
