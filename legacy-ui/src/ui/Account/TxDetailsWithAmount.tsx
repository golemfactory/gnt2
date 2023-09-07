import React, {useState} from 'react';
import styled from 'styled-components';
import {Ticker} from './Balance';
import {convertBalanceToBigJs, isEmpty} from '../../utils/bigNumberUtils';
import {CancelButton} from '../commons/Buttons/CancelButton';
import {Box, BoxContent, BoxRow, BoxSubTitle, BoxTitle} from '../commons/Box';
import {WithValueDescription} from './AccountActionDescriptions';
import {NumberInput} from '../NumberInput';
import {BoxFooterContainer} from '../BoxFooterContainer';

interface TxDetailsWithAmountProps {
  onCancelClick: () => void;
  onAmountConfirm: (toMigrate: string) => void;
  description: WithValueDescription;
}

export const TxDetailsWithAmount = ({onAmountConfirm, onCancelClick, description: {balance, from, to, title}}: TxDetailsWithAmountProps) => {
  const [tokensToConvert, setTokensToConvert] = useState<string>('');
  const [isTouched, setTouched] = React.useState<boolean>(false);
  const [inputError, setInputError] = useState<string | undefined>(undefined);

  const onConfirmClick = () => {
    if (!isTouched) {
      setTouched(true);
      return;
    }
    onAmountConfirm(tokensToConvert);
  };

  return (
    <>
      <Box>
        <BoxContent>
          <BoxTitle>{title}</BoxTitle>
          <Converting>
            <BoxSubTitle>Converting</BoxSubTitle>
            <NumberInput
              dataTestId='convert'
              value={tokensToConvert}
              setValue={amount => setTokensToConvert(amount)}
              unitName={from}
              balance={balance}
              error={inputError}
              setError={message => setInputError(message)}
              isTouched={isTouched}
              setTouched={value => setTouched(value)}
              min={0}
              max={convertBalanceToBigJs(balance)}
            />
          </Converting>
          <div>
            <BoxSubTitle>Receiving</BoxSubTitle>
            <BoxRow>
              <ReceivingTicker>{to}</ReceivingTicker>
              <ReceivingAmount>{tokensToConvert}</ReceivingAmount>
            </BoxRow>
          </div>
        </BoxContent>
        <BoxFooterContainer
          confirmBtnDataTestId='convert-button'
          onConfirmClick={onConfirmClick}
          disabled={!!inputError || isEmpty(balance)}
        />
      </Box>
      <CancelButton onClick={onCancelClick}>Cancel this Conversion</CancelButton>
    </>
  );
};

const Converting = styled.div`
  margin-bottom: 24px;
`;

const ReceivingTicker = styled(Ticker)`
  font-size: 20px;
  line-height: 26px;
`;

const ReceivingAmount = styled.p`
  font-family: Roboto Mono;
  font-weight: normal;
  font-size: 24px;
  line-height: 28px;
  text-align: right;
  color: #1722A2;
`;
