import React, {ChangeEvent, useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {SmallTitle} from '../commons/Text/SmallTitle';
import {Ticker} from './Balance';
import {TitleWithTooltip} from '../commons/Text/TitleWithTooltip';
import {formatTokenBalance, formatValue} from '../../utils/formatter';
import {BigNumber} from 'ethers/utils';
import {convertBalanceToBigJs, isEmpty} from '../../utils/bigNumberUtils';
import {Big} from 'big.js';
import {useServices} from '../hooks/useServices';
import {useProperty} from '../hooks/useProperty';
import {useAsync} from '../hooks/useAsync';
import {CancelButton} from '../commons/Buttons/CancelButton';
import {Box, BoxContent, BoxFooter, BoxFooterRow, BoxFooterButton, BoxTitle, BoxSubTitle, BoxFooterAmount, BoxRow} from '../commons/Box';
import {WithValueDescription} from './AccountActionDescriptions';

interface ConvertTokensProps {
  onCancelClick: () => void;
  onAmountConfirm: (toMigrate: string) => void;
  description: WithValueDescription;
}

export const ConvertTokens = ({onAmountConfirm, onCancelClick, description: {balance, from, to, title}}: ConvertTokensProps) => {
  const [tokensToConvert, setTokensToConvert] = useState<string>('0');
  const {accountService, connectionService} = useServices();
  const network = useProperty(connectionService.network);
  const account = useProperty(connectionService.account);
  const [isTouched, setTouched] = React.useState<boolean>(false);
  const useAsyncBalance = (execute: () => Promise<BigNumber | undefined>) => useAsync(execute, [network, account]);
  const [ethBalance] = useAsyncBalance(async () => accountService.balanceOf(account));

  const [lowEth, setLowEth] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const tokensToConvertAsNumber = useCallback(() => new Big(tokensToConvert), [tokensToConvert]);

  const invalidNumbersOfTokensToConvert = useCallback(() => isNotANumber(tokensToConvert) ||
    tokensToConvertAsNumber().gt(convertBalanceToBigJs(balance)) ||
    tokensToConvertAsNumber().lte(0), [balance, tokensToConvert, tokensToConvertAsNumber]);

  useEffect(() => {
    if (isTouched && invalidNumbersOfTokensToConvert()) {
      setError('Value entered is not a valid tokens amount');
    } else {
      setError(undefined);
    }
  }, [tokensToConvert, balance, invalidNumbersOfTokensToConvert, isTouched]);

  useEffect(() => {
    if (!ethBalance) {
      return;
    }
    setLowEth(convertBalanceToBigJs(ethBalance).lt(new Big('0.0002')));
  }, [ethBalance]);

  const formattedBalance = formatTokenBalance(balance);

  const isNotANumber = (value: string): boolean => {
    try {
      Big(value);
      return false;
    } catch {
      return true;
    }
  };

  const onConfirmClick = () => {
    if (!isTouched) {
      setTouched(true);
      return;
    }
    onAmountConfirm(tokensToConvert);
  };

  const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isTouched) setTouched(true);

    const value = e.target.value;
    if (value === '') {
      setTokensToConvert('0');
      return;
    }
    const regex = new RegExp('^[0-9]{0,18}([,.][0-9]{0,18})?$');
    if (regex.test(value)) {
      setTokensToConvert(value);
    }
  };

  return (
    <>
      <Box>
        <BoxContent>
          <BoxTitle>{title}</BoxTitle>
          <Converting>
            <BoxSubTitle>Converting</BoxSubTitle>
            <ConvertingRow>
              <Ticker>{from}</Ticker>
              <InputRow>
                <InputWrapper>
                  <Input
                    data-testid="migrate-input"
                    value={tokensToConvert}
                    onChange={onAmountChange}
                  />
                  {error && <ErrorInfo data-testid="migrate-error">{error}</ErrorInfo>}
                  <AvailableAmountRow>
                    <SmallTitle>Available:</SmallTitle>
                    <AvailableAmount>{formattedBalance} {from}</AvailableAmount>
                  </AvailableAmountRow>
                </InputWrapper>
                <SetMaxButton
                  data-testid="migrate-btn-set-max"
                  onClick={() => setTokensToConvert(convertBalanceToBigJs(balance).toString())}
                >
                  SET MAX
                </SetMaxButton>
              </InputRow>
            </ConvertingRow>
          </Converting>
          <div>
            <BoxSubTitle>Receiving</BoxSubTitle>
            <BoxRow>
              <ReceivingTicker>{to}</ReceivingTicker>
              <ReceivingAmount>{tokensToConvert}</ReceivingAmount>
            </BoxRow>
          </div>
        </BoxContent>
        <BoxFooter>
          <BoxFooterRow>
            <div>
              <TitleWithTooltip
                tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vehicula vehicula odio, ut scelerisque massa.Learn more">
                ETH Balance:
              </TitleWithTooltip>
              {ethBalance && <BoxFooterAmount isError={lowEth}>{formatValue(ethBalance, 4)} ETH</BoxFooterAmount>}
            </div>
            <BoxFooterButton
              data-testid="migrate-button"
              onClick={onConfirmClick}
              disabled={lowEth || invalidNumbersOfTokensToConvert() || isEmpty(balance)}
            >
              Confirm Transaction
            </BoxFooterButton>
          </BoxFooterRow>
          {lowEth &&
          <ErrorInfo>
            You may not have enough ETH on your account to cover gas fees. Please top up your account with at least 0.03 ETH.
          </ErrorInfo>
          }
        </BoxFooter>
      </Box>
      <CancelButton onClick={onCancelClick}>Cancel Converting</CancelButton>
    </>
  );
};

const Converting = styled.div`
  margin-bottom: 24px;
`;

const ConvertingRow = styled(BoxRow)`
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

const ReceivingTicker = styled(Ticker)`
  font-size: 20px;
  line-height: 26px;
`;

const ReceivingAmount = styled.p`
  font-size: 24px;
  line-height: 28px;
  text-align: right;
  color: #1722A2;
`;

const ErrorInfo = styled.p`
  margin-top: 16px;
  font-size: 12px;
  line-height: 18px;
  color: #EC0505;
  opacity: 0.6;
`;
