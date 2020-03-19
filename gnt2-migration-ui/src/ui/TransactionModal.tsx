import React, {ReactNode} from 'react';
import styled from 'styled-components';
import {Spinner} from './Spinner';
import txfail from '../assets/icons/txfail.svg';
import txpass from '../assets/icons/txpass.svg';


export interface TransactionModalProps {
  children: ReactNode;
  inProgress: boolean;
  errorMessage: string | undefined;
}

export const TransactionModal = ({children, inProgress, errorMessage}: TransactionModalProps) =>
  (<ModalBackdrop className='modal-backdrop' data-testid='modal'>
    <ModalBody className={'modal-body'}>
      <TxSpinner>
        {inProgress
          ? <Spinner/>
          : <img src={errorMessage ? txfail : txpass}/>
        }
      </TxSpinner>
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


const TxSpinner = styled.div`
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
