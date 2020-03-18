import React from 'react';
import styled from 'styled-components';
import {CTAButton} from './commons/CTAButton';


interface TransactionProgressProps {
  transactionHash: string | undefined;
  errorMessage: string | undefined;
  inProgress: boolean;
}

export const TransactionProgress = ({
  transactionHash,
  errorMessage,
  inProgress
}: TransactionProgressProps) => {
  let title = 'Transaction is in progress';

  if (!inProgress) {
    title = 'Transaction complete';
    if (errorMessage) {
      title = 'Error';
    }
  }
  const showOKButton = false;
  return (
    <>
      <Title>
        {title}
      </Title>
      <ModalText>Your 3459284,24561245 GNT are being converted. It can take some time and soon you will received your NGNT!</ModalText>
      {!errorMessage &&
        <a
          href={`https://rinkeby.etherscan.io/tx/${transactionHash && transactionHash}`}
          data-testid='etherscan-link'
        >
          <Buttons showOKButton={showOKButton}>
            <CTAButton
              data-testid='etherscan-button'
              disabled={errorMessage !== undefined || transactionHash === undefined}
            >
                  View on etherscan
            </CTAButton>
            {showOKButton &&
            <OkButton>
                  View on etherscan
            </OkButton>}
          </Buttons>
        </a>
      }
      {errorMessage && <div data-testid='error-message'>{errorMessage}</div>}
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

const Buttons = styled.div<{showOKButton: boolean}>`
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
