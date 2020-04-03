import React from 'react';
import styled from 'styled-components';
import {CTAButton} from './commons/CTAButton';
import {useServices} from './hooks/useServices';
import {useProperty} from './hooks/useProperty';

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
  const showOKButton = !inProgress || !!errorMessage;
  const {connectionService} = useServices();
  const network = useProperty(connectionService.network);

  function getTitle() {
    if (errorMessage) {
      return 'Transaction failed';
    }
    if (!inProgress) {
      return 'Transaction completed';
    }
    return 'Transaction in Progress';
  }

  function getDescription() {
    if (errorMessage) {
      return `This conversion has failed. Check the videos and text guides for troubleshooting. Reason: ${errorMessage}`;
    }
    if (!inProgress) {
      return `${description} completed successfully`;
    }
    return description;
  }

  function doNotShowTransactionLink() {
    return !network || network === 'local' || !transactionHash;
  }

  function transactionLink() {
    if (doNotShowTransactionLink()) {
      return;
    }
    return `https://${network === 'mainnet' ? '' : network + '.'}etherscan.io/tx/${transactionHash}`;
  }

  return (
    <>
      <Title>
        {getTitle()}
      </Title>
      <ModalText data-testid='error-message'>{getDescription()}</ModalText>
      <Buttons showOKButton={showOKButton}>
        <a
          href={transactionLink()}
          data-testid='etherscan-link'
          target="_blank"
          rel="noopener noreferrer"
        >
          <CTAButton
            data-testid='etherscan-button'
            disabled={doNotShowTransactionLink()}
          >
            View on etherscan
          </CTAButton>
        </a>
        {showOKButton &&
          <OkButton onClick={onClose} data-testid='modal-close'>
            Ok
          </OkButton>}
      </Buttons>
    </>
  );
};

const Title = styled.p`
  font-family: AktivGroteskEx;
  text-align: center;
  font-weight: bold;
  font-size: 24px;
  line-height: 31px;
  color: #181EA9;
  margin-bottom: 40px;
`;

const ModalText = styled.p`
  font-family: AktivGrotesk;
  font-weight: 300;
  font-size: 18px;
  line-height: 30px;
  color: #1722A2;
  opacity: 0.6;
`;

const Buttons = styled.div<{ showOKButton: boolean }>`
  position: absolute;
  bottom: 42px;
  display: flex;
  padding-top: 165px;
  justify-content: ${({showOKButton}) => showOKButton ? 'space-between' : 'center'};
  width: 84%;
  margin: 0 auto;
`;


const OkButton = styled(CTAButton)`
  background: #181EA9;
  color: #fff;
`;
