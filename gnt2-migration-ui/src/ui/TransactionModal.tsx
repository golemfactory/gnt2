import React, {ReactNode} from 'react';
import styled from 'styled-components';
import {Spinner} from './Spinner';
import txfail from '../assets/icons/txfail.svg';
import txpass from '../assets/icons/txpass.svg';


export interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  inProgress: boolean;
}

export const TransactionModal = ({children, onClose, inProgress}: ModalProps) =>
  (<ModalBackdrop className='modal-backdrop' data-testid='modal'>
    <ModalBody className={'modal-body'}>
      {inProgress
        ? <Spinner/>
        : <ResultImage src={inProgress ? txfail : txpass}/>
      }
      {children}
    </ModalBody>
  </ModalBackdrop>);

const ModalBackdrop = styled.div`
  position: absolute;
  top: 300px;
  z-index: 1000;
`;

const ModalBody = styled.div`
  padding: 48px;
  max-width: 60%;
  min-height: 457px;
  max-height: 95%;
  overflow-y: scroll;
  background-color: #FFFFFF;
  border: 1px solid #181EA9;
  box-sizing: border-box;
`;

const ResultImage = styled.img`
  position: absolute;
  top: 55%;
  left: 27%;
`;
