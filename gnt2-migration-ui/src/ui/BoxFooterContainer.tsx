import React from 'react';
import {BoxFooter, BoxFooterAmount, BoxFooterButton, BoxFooterRow} from './commons/Box';
import {TitleWithTooltip} from './commons/Text/TitleWithTooltip';
import {formatTokenBalance} from '../utils/formatter';
import styled from 'styled-components';
import {useProperty} from './hooks/useProperty';
import {useServices} from './hooks/useServices';

interface BoxFooterContainerProps {
  onConfirmClick: () => void;
  disabled?: boolean;
  confirmBtnDataTestId?: string;
}

export const BoxFooterContainer = ({
  confirmBtnDataTestId = 'confirm-button',
  onConfirmClick,
  disabled = false
}: BoxFooterContainerProps) => {
  const {etherService} = useServices();
  const ethBalance = useProperty(etherService.etherBalance);
  const lowEth = useProperty(etherService.lowBalance);

  return (
    <BoxFooter>
      <BoxFooterRow>
        <EtherSection>
          <TitleWithTooltip
            tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vehicula vehicula odio, ut scelerisque massa.Learn more">
            ETH Balance:
          </TitleWithTooltip>
          {ethBalance && <BoxFooterAmount isError={lowEth}>{formatTokenBalance(ethBalance)} ETH</BoxFooterAmount>}
        </EtherSection>
        <BoxFooterButton
          data-testid={confirmBtnDataTestId}
          onClick={onConfirmClick}
          disabled={disabled}
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
  );
};

const ErrorInfo = styled.p`
  margin-top: 16px;
  font-size: 12px;
  line-height: 18px;
  color: #EC0505;
  opacity: 0.6;
`;

const EtherSection = styled.div`
  width: 100%;
  margin-right: 10px;
`;
