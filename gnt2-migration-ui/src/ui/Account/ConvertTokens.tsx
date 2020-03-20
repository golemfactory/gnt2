import React, {ChangeEvent, useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {SectionTitle} from '../commons/Text/SectionTitle';
import {SmallTitle} from '../commons/Text/SmallTitle';
import {Ticker} from './Balance';
import {TitleWithTooltip} from '../commons/Text/TitleWithTooltip';
import {ButtonPrimary} from '../commons/Buttons/ButtonPrimary';
import {formatValue} from '../../utils/formatter';
import {BigNumber} from 'ethers/utils';
import {convertBalanceToBigJs, isEmpty} from '../../utils/bigNumberUtils';
import {Big} from 'big.js';
import {useServices} from '../hooks/useServices';
import {useProperty} from '../hooks/useProperty';
import {useAsync} from '../hooks/useAsync';

interface ConvertTokensProps {
  onCancelClick: () => void;
  onAmountConfirm: (toMigrate: string) => void;
  oldTokensBalance: BigNumber;
  tokensToMigrate: string;
  setTokensToMigrate: (value: string) => void;
}

export const ConvertTokens = ({onAmountConfirm, onCancelClick, oldTokensBalance, tokensToMigrate, setTokensToMigrate}: ConvertTokensProps) => {
  const {accountService, connectionService} = useServices();
  const network = useProperty(connectionService.network);
  const account = useProperty(connectionService.account);
  const useAsyncBalance = (execute: () => Promise<BigNumber | undefined>) => useAsync(execute, [network, account]);
  const [ethBalance] = useAsyncBalance(async () => accountService.balanceOf(account));

  const [lowEth, setLowEth] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const tokensToMigrateAsNumber = useCallback(() => new Big(tokensToMigrate), [tokensToMigrate]);

  const invalidNumbersOfTokensToMigrate = useCallback(() => isNotANumber(tokensToMigrate) ||
    tokensToMigrateAsNumber().gt(convertBalanceToBigJs(oldTokensBalance)) ||
    tokensToMigrateAsNumber().lte(0), [oldTokensBalance, tokensToMigrate, tokensToMigrateAsNumber]);

  useEffect(() => {
    if (invalidNumbersOfTokensToMigrate()) {
      setError('Invalid number of tokens to migrate');
    } else {
      setError(undefined);
    }
  }, [tokensToMigrate, oldTokensBalance, invalidNumbersOfTokensToMigrate]);

  useEffect(() => {
    if (!ethBalance) {
      return;
    }
    setLowEth(convertBalanceToBigJs(ethBalance).lt(new Big('0.0002')));
  }, [ethBalance]);

  const format = (value: BigNumber) => formatValue(value.toString(), 3);
  const balance = format(new BigNumber(oldTokensBalance));

  const isNotANumber = (value: string): boolean => {
    try {
      Big(value);
      return false;
    } catch {
      return true;
    }
  };

  const onConfirmClick = () => {
    onAmountConfirm(tokensToMigrate);
  };

  const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTokensToMigrate(e.target.value);
  };

  return (
    <>
      <View>
        <Content>
          <Title>Convert</Title>
          <Converting>
            <SubTitle>Converting</SubTitle>
            <ConvertingRow>
              <Ticker>GNT</Ticker>
              <InputRow>
                <InputWrapper>
                  <Input
                    data-testid="migrate-input"
                    type="number"
                    max={balance}
                    min="0.000"
                    step="0.001"
                    value={tokensToMigrate}
                    onChange={onAmountChange}
                  />
                  {error && <ErrorInfo data-testid="migrate-error">{error}</ErrorInfo>}
                  <AvailableAmountRow>
                    <SmallTitle>Available:</SmallTitle>
                    <AvailableAmount>{balance} GNT</AvailableAmount>
                  </AvailableAmountRow>
                </InputWrapper>
                <SetMaxButton
                  data-testid="migrate-btn-set-max"
                  onClick={() => setTokensToMigrate(convertBalanceToBigJs(oldTokensBalance).toString())}
                >
                  SET MAX
                </SetMaxButton>
              </InputRow>
            </ConvertingRow>
          </Converting>
          <div>
            <SubTitle>Receiving</SubTitle>
            <ReceivingRow>
              <ReceivingTicker>NGNT</ReceivingTicker>
              <ReceivingAmount>{balance}</ReceivingAmount>
            </ReceivingRow>
          </div>
        </Content>
        <Footer>
          <FooterRow>
            <div>
              <TitleWithTooltip
                tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vehicula vehicula odio, ut scelerisque massa.Learn more">
                ETH Balance:
              </TitleWithTooltip>
              {ethBalance && <EthereumAmount isError={lowEth}>{formatValue(ethBalance, 4)} ETH</EthereumAmount>}
            </div>
            <ConfirmButton
              data-testid="migrate-button"
              onClick={onConfirmClick}
              disabled={lowEth || invalidNumbersOfTokensToMigrate() || isEmpty(oldTokensBalance)}
            >
              Confirm Transaction
            </ConfirmButton>
          </FooterRow>
          {lowEth &&
          <ErrorInfo>
            You do not have enough ETH on your account to cover gas fees and make NGNT Conversion. Please top up your account with at least 0.03 ETH.
          </ErrorInfo>
          }
        </Footer>
      </View>
      <CancelButton onClick={onCancelClick}>Cancel Converting</CancelButton>
    </>
  );
};

const View = styled.div`
  border: 1px solid #181EA9;
`;

const Content = styled.div`
  padding: 40px 48px 70px;
`;

const Title = styled(SectionTitle)`
  margin-bottom: 40px;
  text-align: center;
`;

const Converting = styled.div`
  margin-bottom: 24px;
`;

const SubTitle = styled(SmallTitle)`
  border-bottom: 1px solid rgb(232, 232, 246);
`;

const ConvertingRow = styled.div`
  display: flex;
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

const ReceivingRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
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

const Footer = styled.div`
  border-top: 1px solid #181EA9;
  padding: 24px 48px;
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ConfirmButton = styled(ButtonPrimary)`
  max-width: 238px;
  width: 100%;
`;

interface EthereumAmountProps {
  isError: boolean;
}

const EthereumAmount = styled.p<EthereumAmountProps>`
  margin-top: 3px;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  color: ${({isError}) => isError ? '#EC0505' : '#1722A2'};
`;

const CancelButton = styled.button`
  display: block;
  margin: 21px auto 0;
  padding: 0;
  border: none;
  background: none;
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  text-decoration: underline;
  color: #181EA9;
  opacity: 0.6;
`;

const ErrorInfo = styled.p`
  margin-top: 16px;
  font-size: 12px;
  line-height: 18px;
  color: #EC0505;
  opacity: 0.6;
`;
