import React, {ReactNode, useEffect, useCallback} from 'react';
import styled from 'styled-components';
import {createPortal} from 'react-dom';
import crossIcon from '../assets/icons/cross.svg';
import {Spinner} from './Spinner';

export interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
  inProgress?: boolean;
  className?: string;
}

export const Modal = ({isVisible, onClose, children, inProgress, className}: ModalProps) => {
  const listenKeyboard = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' || event.keyCode === 27) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      window.addEventListener('keydown', listenKeyboard, true);
      return () => {
        window.removeEventListener('keydown', listenKeyboard, true);
      };
    }
  }, [isVisible, listenKeyboard]);

  if (isVisible) {
    return createPortal(
      <ModalView data-testid="modal" className={className || ''}>
        <ModalOverlay onClick={onClose}/>
        <ModalBodyWrapper>
          <ModalBody>
            {inProgress
              ? <Spinner/>
              : <>
                <CloseButton onClick={onClose} data-testid="modal-close"/>
                {children}
              </>
            }
          </ModalBody>
        </ModalBodyWrapper>
      </ModalView>,
      document.body
    );
  } else return null;

};

const ModalView = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;  
  z-index: 9999;
`;

const ModalOverlay = styled.div`
  width: 100%;
  height: 100%;
  background-color: #181EA9;
  opacity: 0.4;
`;

const ModalBodyWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 30px;
  max-height: 100%;
  overflow-y: auto;
`;

const ModalBody = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 770px;
  width: 100%;
  padding: 40px 30px;
  background: #FFFFFF;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  background: url(${crossIcon}) center no-repeat;
  border: none;
`;
