import React, {ReactNode} from 'react';
import styled from 'styled-components';
import {Spinner} from './Spinner';

export interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  inProgress: boolean;
}

export const Modal = ({children, onClose, inProgress}: ModalProps) =>
  (<ModalBackdrop className='modal-backdrop' data-testid='modal'>
    <ModalBody className={'modal-body'}>
      {inProgress
        ? <Spinner/>
        : <CloseButton className='modal-close' data-testid='modal-close' onClick={onClose}/>
      }
      {children}
    </ModalBody>
  </ModalBackdrop>);

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(12, 35, 64, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalBody = styled.div`
  position: relative;
  padding: 30px 40px;
  min-width: 400px;
  min-height: 100px;
  max-height: 95%;
  overflow-y: scroll;
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.2);
`;

const CloseButton = styled.div`
  position: absolute;
  top: 30px;
  right: 30px;
  width: 20px;
  height: 20px;

  &::before, &::after {
    content: '';
    width: 17px;
    height: 2px;
    border-radius: 1px;
    display: block;
    background-color: #1c1c1c;
    transform: translate(-50%, -50%) rotate(45deg);
    position: absolute;
    top: 10px;
    left: 10px;
  }
  &::after {
    transform: translate(-50%, -50%) rotate(135deg);
  }
`;
