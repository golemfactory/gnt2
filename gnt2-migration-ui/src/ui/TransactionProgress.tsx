import React from 'react';
import styled from 'styled-components';
import {CTAButton} from './commons/CTAButton';


interface TransactionProgressProps {
  transactionHash: string | undefined;
  errorMessage: string | undefined;
  inProgress: boolean;
  onClose: () => void;
  description: string;
}

export const TransactionProgress = ({
  transactionHash,
  errorMessage,
  inProgress,
  onClose,
  description
}: TransactionProgressProps) => {
  let title = 'Transaction is in progress';

  if (!inProgress) {
    title = 'Transaction complete';
    if (errorMessage) {
      title = 'Error';
    }
  }
  const showOKButton = !inProgress;
  return (
    <>
      <Title>
        {title}
      </Title>
      <ModalText data-testid='error-message'>{errorMessage || description}</ModalText>

      <Buttons showOKButton={showOKButton}>
        <CTAButton
          data-testid='etherscan-button'
          disabled={errorMessage !== undefined || transactionHash === undefined}
        >
          <a
            href={`https://rinkeby.etherscan.io/tx/${transactionHash && transactionHash}`}
            data-testid='etherscan-link'
          >
            View on etherscan </a>
        </CTAButton>
        {showOKButton &&
        <OkButton onClick={onClose} data-testid='modal-close'>
          OK
        </OkButton>}
      </Buttons>
    </>
  );
};

const Title = styled.p`
  text-align: center;
  font-weight: bold;
  font-size: 24px;
  line-height: 31px;
  color: #181EA9;
  margin-bottom: 40px;
`;

const ModalText = styled.p`
  font-size: 18px;
  line-height: 30px;
  color: #1722A2;
  opacity: 0.6;
`;

const Buttons = styled.div<{ showOKButton: boolean }>`
  position: absolute;
  bottom: 42px;
  display: flex;
  justify-content: ${({showOKButton}) => showOKButton ? 'space-between' : 'center'};
  width: 50%;
  margin: 0 auto;
`;

const OkButton = styled(CTAButton)`
  background: #181EA9;
  color: #fff;
`;
