import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {Ticker} from './Balance';
import {TitleWithTooltip} from '../commons/Text/TitleWithTooltip';
import {formatTokenBalance, formatValue} from '../../utils/formatter';
import {formatValue} from '../../utils/formatter';
import {BigNumber} from 'ethers/utils';
import {convertBalanceToBigJs, isEmpty} from '../../utils/bigNumberUtils';
import {Big} from 'big.js';
import {useServices} from '../hooks/useServices';
import {useProperty} from '../hooks/useProperty';
import {CancelButton} from '../commons/Buttons/CancelButton';
import {Box, BoxContent, BoxFooter, BoxFooterAmount, BoxFooterButton, BoxFooterRow, BoxRow, BoxSubTitle, BoxTitle} from '../commons/Box';
import {WithValueDescription} from './AccountActionDescriptions';
import {NumberInput} from '../NumberInput';

interface ConvertTokensProps {
  onCancelClick: () => void;
  onAmountConfirm: (toMigrate: string) => void;
  description: WithValueDescription;
}

export const ConvertTokens = ({onAmountConfirm, onCancelClick, description: {balance, from, to, title}}: ConvertTokensProps) => {
  const [tokensToConvert, setTokensToConvert] = useState<string>('0.000');
  const {etherService} = useServices();
  const ethBalance = useProperty(etherService.etherBalance);
  const [isTouched, setTouched] = React.useState<boolean>(false);

  const [lowEth, setLowEth] = useState(false);
  const [inputError, setInputError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!ethBalance) { return; }
    setLowEth(convertBalanceToBigJs(ethBalance).lt(new Big('0.0002')));
  }, [ethBalance]);

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
              disabled={lowEth || !!inputError || isEmpty(balance)}
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
