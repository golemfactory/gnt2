import React, {ChangeEvent, useEffect, useState} from 'react';
import styled from 'styled-components';
import {SmallTitle} from './commons/Text/SmallTitle';
import {Ticker} from './Account/Balance';
import {BoxRow} from './commons/Box';
import {formatTokenBalance} from '../utils/formatter';
import {convertBalanceToBigJs} from '../utils/bigNumberUtils';
import {BigNumber} from 'ethers/utils';

interface NumberInputInterface {
  value: string;
  balance: BigNumber;
  from: string;
  isTouched: boolean;
  setTouched: (value: boolean) => void;
  validator: () => void;
  setValue: (amount: string) => void;
}

export const NumberInput = ({
  value,
  balance,
  from,
  isTouched,
  setTouched,
  validator,
  setValue
}: NumberInputInterface) => {
  const [error, setError] = useState<string | undefined>(undefined);


  useEffect(() => {
    if (isTouched && validator()) {
      setError('Value entered is not a valid tokens amount');
    } else {
      setError(undefined);
    }
  }, [balance, isTouched, validator, value]);

  const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isTouched) setTouched(true);

    const value = e.target.value;
    if (value === '') {
      setValue('0');
      return;
    }
    const regex = new RegExp('^[0-9]*([,.][0-9]*)?$');
    if (regex.test(value)) {
      setValue(value);
    }
  };

  const formattedBalance = formatTokenBalance(balance);

  return (
    <Row>
      <Ticker>{from}</Ticker>
      <InputRow>
        <InputWrapper>
          <Input
            data-testid='convert-input'
            value={value}
            onChange={onAmountChange}
          />
          {error && <ErrorInfo data-testid='convert-input-error'>{error}</ErrorInfo>}
          <AvailableAmountRow>
            <SmallTitle>Available:</SmallTitle>
            <AvailableAmount>{formattedBalance} {from}</AvailableAmount>
          </AvailableAmountRow>
        </InputWrapper>
        <SetMaxButton
          data-testid='convert-input-set-max'
          onClick={() => setValue(convertBalanceToBigJs(balance).toString())}
        >
        SET MAX
        </SetMaxButton>
      </InputRow>
    </Row>
  );
};

const Row = styled(BoxRow)`
  margin-top: 25px;
`;

const InputRow = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

const InputWrapper = styled.div`
  width: 100%;
  max-width: 332px;
`;

const Input = styled.input`
  width: 100%;
  max-width: 332px;
  padding: 0 0 12px;
  font-size: 18px;
  line-height: 21px;
  text-align: right;
  color: #1722A2;
  border: none;
  border-bottom: 1px solid #1722A2;
  outline: none;
`;

const SetMaxButton = styled.button`
  padding: 0;
  margin: 4px 0 0 23px;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #181EA9;
  background: none;
  border: none;
`;

const AvailableAmountRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
`;

const AvailableAmount = styled.p`
  margin-left: 16px;
  font-size: 13px;
  line-height: 15px;
  color: #1722A2;
`;

const ErrorInfo = styled.p`
  margin-top: 16px;
  font-size: 12px;
  line-height: 18px;
  color: #EC0505;
  opacity: 0.6;
`;
