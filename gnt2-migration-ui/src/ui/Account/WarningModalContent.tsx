import React from 'react';
import {SectionTitle} from '../commons/Text/SectionTitle';
import {Text} from '../commons/Text/Text';
import {CancelButton} from '../commons/Buttons/CancelButton';
import {ButtonPrimary} from '../commons/Buttons/ButtonPrimary';
import styled from 'styled-components';

export interface WarningModalContentProps {
  onConfirmClick: () => void;
  onCancelClick: () => void;
}

export const WarningModalContent = ({onConfirmClick, onCancelClick}: WarningModalContentProps) => (
  <ModalContent>
    <Title>Warning</Title>
    <Text>You are going to convert your GNT and you still have balance in GNTb and/or GNTb Deposit. If you plan to convert them later,
      additional Ethereum transactions will be required.</Text>
    <Button
      data-testid="continue-migrate-button"
      onClick={onConfirmClick}
    >
      OK, GOT IT
    </Button>
    <CancelButton onClick={onCancelClick}>Cancel converting</CancelButton>
  </ModalContent>
);

const ModalContent = styled.div`
  max-width: 484px;
  margin: 0 auto;
`;

const Title = styled(SectionTitle)`
  margin-bottom: 38px;
  text-align: center;
`;

const Button = styled(ButtonPrimary)`
  display: block;
  max-width: 188px;
  margin: 40px auto 0;
`;
