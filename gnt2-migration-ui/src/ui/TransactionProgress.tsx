import React from 'react';
import styled from 'styled-components';
import {CTAButton} from './commons/CTAButton';
import {Spinner} from './Spinner';

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
  let title = 'Transaction in progress';

  if (!inProgress) {
    title = 'Transaction complete';
    if (errorMessage) {
      title = 'Error';
    }
  }

  return (
    <>
      <Title>
        {title}
      </Title>
      {inProgress && <Spinner/>}
      {!errorMessage &&
        <a
          href={`https://rinkeby.etherscan.io/tx/${transactionHash && transactionHash}`}
          data-testid='etherscan-link'
        >
          <CTAButton
            data-testid='etherscan-button'
            disabled={errorMessage !== undefined || transactionHash === undefined}
          >
                View transaction details
          </CTAButton>
        </a>
      }
      {errorMessage && <div data-testid='error-message'>{errorMessage}</div>}
    </>
  );
};

const Title = styled.p`
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  line-height: 29px;
  color: #181EA9;
`;
