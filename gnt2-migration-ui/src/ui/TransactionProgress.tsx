import React from 'react';
import styled from 'styled-components';
import {CTAButton} from './commons/CTAButton';
import {useServices} from './hooks/useServices';
import {useProperty} from './hooks/useProperty';
import {Spinner} from './commons/Spinner';
import txfail from '../assets/icons/txfail.svg';
import txpass from '../assets/icons/txpass.svg';

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
      <TxSpinner>
        {inProgress
          ? <Spinner/>
          : <img src={errorMessage ? txfail : txpass} alt={'tx status'}/>
        }
      </TxSpinner>
      <ButtonsSection showOKButton={showOKButton}>
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
      </ButtonsSection>
    </>
  );
};

const TxSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 55px;
`;

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
  font-weight: 300;
  font-size: 18px;
  line-height: 30px;
  color: #1722A2;
  opacity: 0.6;
`;

const ButtonsSection = styled.div<{ showOKButton: boolean }>`
  bottom: 42px;
  display: flex;
  padding-top: 50px;
  justify-content: ${({showOKButton}) => showOKButton ? 'space-between' : 'center'};
  width: 84%;
  margin: 0 auto;
  @media (max-width: 340px) {
    width: ;
    flex-direction: column;
  }
`;

const OkButton = styled(CTAButton)`
  background: #181EA9;
  color: #fff;
`;
