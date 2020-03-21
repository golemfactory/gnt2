import React, {useEffect, useState} from 'react';
import {Box, BoxContent, BoxFooter, BoxFooterAmount, BoxFooterButton, BoxFooterRow, BoxRow, BoxSubTitle, BoxTitle} from '../commons/Box';
import {Ticker} from './Balance';
import styled from 'styled-components';
import {TitleWithTooltip} from '../commons/Text/TitleWithTooltip';
import {CancelButton} from '../commons/Buttons/CancelButton';
import {BigNumber} from 'ethers/utils';
import {useServices} from '../hooks/useServices';
import {useProperty} from '../hooks/useProperty';
import {useAsync} from '../hooks/useAsync';
import {convertBalanceToBigJs} from '../../utils/bigNumberUtils';
import {Big} from 'big.js';
import {formatTokenBalance, formatValue} from '../../utils/formatter';
import {WithoutValueDescription} from './AccountActionDescriptions';

interface MoveToWrappedProps {
  onCancelClick: () => void;
  onConfirm: () => void;
  description: WithoutValueDescription;
}

export const MoveToWrapped = ({onCancelClick, onConfirm, description}: MoveToWrappedProps) => {
  const {accountService, connectionService} = useServices();
  const network = useProperty(connectionService.network);
  const account = useProperty(connectionService.account);
  const useAsyncBalance = (execute: () => Promise<BigNumber | undefined>) => useAsync(execute, [network, account]);
  const [ethBalance] = useAsyncBalance(async () => accountService.balanceOf(account));
  const [lowEth, setLowEth] = useState(false);

  useEffect(() => {
    if (!ethBalance) {
      return;
    }
    setLowEth(convertBalanceToBigJs(ethBalance).lt(new Big('0.0002')));
  }, [ethBalance]);

  return (
    <>
      <Box>
        <BoxContent>
          <BoxTitle>{description.title}</BoxTitle>
          <BoxSubTitle>{description.subtitle}</BoxSubTitle>
          <BoxRow>
            <Ticker>{description.from}</Ticker>
            <Amount>{formatTokenBalance(description.balance)}</Amount>
          </BoxRow>
        </BoxContent>
        <BoxFooter>
          <BoxFooterRow>
            <div>
              <TitleWithTooltip
                tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vehicula vehicula odio, ut scelerisque massa.Learn more"
              >
                ETH Balance:
              </TitleWithTooltip>
              {ethBalance && <BoxFooterAmount isError={lowEth}>{formatValue(ethBalance, 4)} ETH</BoxFooterAmount>}
            </div>
            <BoxFooterButton data-testid="confirm-button" onClick={onConfirm}>Confirm Transaction</BoxFooterButton>
          </BoxFooterRow>
          {lowEth &&
          <ErrorInfo>
            You may not have enough ETH on your account to cover gas fees. Please top up your account with at least 0.03 ETH.
          </ErrorInfo>
          }
        </BoxFooter>
      </Box>
      <CancelButton onClick={onCancelClick}>Cancel</CancelButton>
    </>
  );
};

const Amount = styled.p`
  font-size: 18px;
  line-height: 21px;
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
