import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {Ticker} from './Balance';
import {TitleWithTooltip} from '../commons/Text/TitleWithTooltip';
import {formatValue} from '../../utils/formatter';
import {BigNumber} from 'ethers/utils';
import {convertBalanceToBigJs, isEmpty} from '../../utils/bigNumberUtils';
import {Big} from 'big.js';
import {useServices} from '../hooks/useServices';
import {useProperty} from '../hooks/useProperty';
import {useAsync} from '../hooks/useAsync';
import {CancelButton} from '../commons/Buttons/CancelButton';
import {Box, BoxContent, BoxFooter, BoxFooterRow, BoxFooterButton, BoxTitle, BoxSubTitle, BoxFooterAmount, BoxRow} from '../commons/Box';
import {WithValueDescription} from './AccountActionDescriptions';
import {NumberInput} from '../NumberInput';

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

  const tokensToConvertAsNumber = useCallback(() => new Big(tokensToConvert), [tokensToConvert]);

  const invalidNumbersOfTokens = useCallback(() => isNotANumber(tokensToConvert) ||
    tokensToConvertAsNumber().gt(convertBalanceToBigJs(balance)) ||
    tokensToConvertAsNumber().lte(0),
  [balance, tokensToConvert, tokensToConvertAsNumber]
  );

  useEffect(() => {
    if (!ethBalance) { return; }
    setLowEth(convertBalanceToBigJs(ethBalance).lt(new Big('0.0002')));
  }, [ethBalance]);

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

  return (
    <>
      <Box>
        <BoxContent>
          <BoxTitle>{title}</BoxTitle>
          <Converting>
            <BoxSubTitle>Converting</BoxSubTitle>
            <NumberInput
              value={tokensToConvert}
              setValue={amount => setTokensToConvert(amount)}
              from={from}
              balance={balance}
              setTouched={value => setTouched(value)}
              isTouched={isTouched}
              validator={() => invalidNumbersOfTokens()}
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
              data-testid="convert-button"
              onClick={onConfirmClick}
              disabled={lowEth || invalidNumbersOfTokens() || isEmpty(balance)}
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
