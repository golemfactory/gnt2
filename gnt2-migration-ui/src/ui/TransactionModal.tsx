import React, {ReactNode} from 'react';
import styled from 'styled-components';

export interface TransactionModalProps {
  children: ReactNode;
}

export const TransactionModal = ({children}: TransactionModalProps) =>
  (<ModalBackdrop className='modal-backdrop' data-testid='modal'>
    <ModalBody className={'modal-body'}>
      {children}
    </ModalBody>
  </ModalBackdrop>);

const ModalBackdrop = styled.div`
`;

const ModalBody = styled.div`
  position: relative;
  padding: 48px;
  width: 100%;
  max-width: 630px;
  min-height: 457px;
  max-height: 95%;
  overflow-y: scroll;
  background-color: #FFFFFF;
  border: 1px solid #181EA9;
  box-sizing: border-box;
`;
