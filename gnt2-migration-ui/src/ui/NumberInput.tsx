import React, {ChangeEvent, useCallback, useEffect} from 'react';
import styled from 'styled-components';
import {SmallTitle} from './commons/Text/SmallTitle';
import {Ticker} from './Account/Balance';
import {BoxRow} from './commons/Box';
import {formatTokenBalance} from '../utils/formatter';
import {convertBalanceToBigJs} from '../utils/bigNumberUtils';
import {BigNumber} from 'ethers/utils';
import {Big} from 'big.js';

interface NumberInputInterface {
  dataTestId?: string;
  placeholder?: string;
  value: string;
  balance: BigNumber;
  unitName: string;
  isTouched: boolean;
  setTouched: (value: boolean) => void;
  setValue: (amount: string) => void;
  error: string | undefined;
  setError: (message: string| undefined) => void;
  max: Big;
  min: number;
}

export const NumberInput = ({
  dataTestId = 'number',
  placeholder,
  value,
  balance,
  unitName,
  isTouched,
  setTouched,
  setValue,
  error,
  setError,
  max,
  min
}: NumberInputInterface) => {
  const valueAsNumber = useCallback(() => new Big(value), [value]);

  const isNotANumber = (value: string): boolean => {
    try {
      Big(value);
      return false;
    } catch {
      return true;
    }
  };

  const validate = useCallback(() =>
    isNotANumber(value) ||
    valueAsNumber().gt(max) ||
    valueAsNumber().lte(min),
  [max, min, value, valueAsNumber]
  );

  useEffect(() => {
    if (isTouched && validate()) {
      setError('Value entered is not a valid tokens amount');
    } else {
      setError(undefined);
    }
  }, [balance, isTouched, setError, validate, value]);

  function updateValue(newValue: string) {
    if (!isTouched) setTouched(true);
    setValue(newValue);
  }

  const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = new RegExp('^[0-9]*([.][0-9]*)?$');
    const valueWithoutComma = value.replace(/,/g, '.');
    if (regex.test(valueWithoutComma)) {
      updateValue(valueWithoutComma);
    }
  };

  const formattedBalance = formatTokenBalance(balance);

  return (
    <Row>
      <Ticker>{unitName}</Ticker>
      <InputRow>
        <InputWrapper>
          <Input
            autoFocus
            placeholder={placeholder}
            data-testid={`${dataTestId}-input`}
            value={value}
            onChange={onAmountChange}
          />
          {error && <ErrorInfo data-testid={`${dataTestId}-input-error`}>{error}</ErrorInfo>}
          <AvailableAmountRow>
            <SmallTitle>Available:</SmallTitle>
            <AvailableAmount>{formattedBalance} {unitName}</AvailableAmount>
          </AvailableAmountRow>
        </InputWrapper>
        <SetMaxButton
          data-testid={`${dataTestId}-input-set-max`}
          onClick={() => updateValue(convertBalanceToBigJs(balance).toString())}
        >
          MAX
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
  font-family: Roboto Mono;
  font-weight: normal;
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
  ::placeholder {
    letter-spacing: 1px;
    color: #181EA9;
    opacity: 0.6;
  }
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
  font-family: Roboto Mono;
  font-weight: normal;
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
