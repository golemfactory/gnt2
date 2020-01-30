import React from 'react';
import styled from 'styled-components';
import {CTAButton} from './commons/CTAButton';

export const TransactionProgress = (props: { transactionHash: string | undefined, errorMessage: string | undefined }) => <>
  <Title>Transaction in progress</Title>
  <a href={`https://rinkeby.etherscan.io/address/${props.transactionHash && props.transactionHash}`}
    data-testid='etherscan-link'>
    <CTAButton data-testid='etherscan-button'
      disabled={props.errorMessage !== undefined || props.transactionHash === undefined}>View transaction
      details</CTAButton>
  </a>
  {props.errorMessage && <div data-testid='error-message'>{props.errorMessage}</div>}
</>;

const Title = styled.p`
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  line-height: 29px;
  color: #181EA9;
`;
