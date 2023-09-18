import React from 'react';
import {SectionTitle} from '../commons/Text/SectionTitle';
import {Text} from '../commons/Text/Text';
import {CancelButton} from '../commons/Buttons/CancelButton';
import {ButtonPrimary} from '../commons/Buttons/ButtonPrimary';
import styled from 'styled-components';

export interface WarningModalContentProps {
  onConfirmClick: () => void;
  onCancelClick?: () => void;
  confirmText?: string;
  cancelText?: string;
  title?: string;
  body: string;
}

export const WarningModalContent = ({
  onConfirmClick,
  onCancelClick,
  title = 'Warning',
  body,
  confirmText = 'OK, GOT IT',
  cancelText = 'Cancel this Conversion'
}: WarningModalContentProps) => (
  <ModalContent>
    <Title>{title}</Title>
    <Text>{body}</Text>
    <Button
      data-testid="modal-button-continue"
      onClick={onConfirmClick}
    >
      {confirmText}
    </Button>
    {
      onCancelClick &&
      <CancelButton onClick={onCancelClick}>{cancelText}</CancelButton>
    }
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
