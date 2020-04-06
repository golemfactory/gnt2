import React, {useState} from 'react';
import {Modal} from '../commons/Modal';
import {TrezorLedgerInstruction} from './TrezorLedgerInstruction';
import {MainTitle} from '../commons/Text/MainTitle';
import {BlockTitle} from '../commons/Text/BlockTitle';
import styled from 'styled-components';
import {Text} from '../commons/Text/Text';
import {ButtonSecondary} from '../commons/Buttons/ButtonSecondary';
import {Checkbox} from '../commons/Form/Checkbox';
import metamaskIcon from '../../assets/icons/metamask.svg';
import {InfoBlock} from '../commons/InfoBlock';
import {useServices} from '../hooks/useServices';
import {ConnectionState} from '../../services/ConnectionService';
import trezorIcon from '../../assets/icons/trezor.svg';
import ledgerIcon from '../../assets/icons/ledger.svg';
import {WalletName} from './WalletName';
import {tokens} from '../../domain/constants';

export interface LoginSelectorProps {
  onMetamaskClick: () => void;
}

export const LoginSelector = ({onMetamaskClick}: LoginSelectorProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const {connectionService} = useServices();
  const noMetaMask = connectionService.connectionState === ConnectionState.NO_METAMASK;

  return (
    <>
      <MainTitle>Golem Token Migrator</MainTitle>
      <StyledText>
        {`Migrate your GNT to the new token version ${tokens.ngnt.ticker}.
        Connect your wallet to view your available GNT balance.`}
      </StyledText>
      <Checkbox
        value={isChecked}
        onChange={setIsChecked}
      >
        I have read and agree to the&nbsp;<Link href='/' onClick={e => e.stopPropagation()}>&quot;Terms and Conditions&quot;</Link>
      </Checkbox>
      <ConnectionBlock>
        <BlockTitle>Connect to:</BlockTitle>
        <MetaMaskButton onClick={onMetamaskClick} disabled={noMetaMask || !isChecked}>
          <img src={metamaskIcon} alt="metamask logo"/> MetaMask
        </MetaMaskButton>
        <InfoRow>
          {
            noMetaMask &&
        <InfoBlock>
          To connect to MetaMask you should install official plugin via your web browser.
        </InfoBlock>
          }
          {
            !noMetaMask && !isChecked &&
          <InfoBlock>
            You must accept terms and conditions.
          </InfoBlock>
          }
        </InfoRow>
        <ConnectLabel onClick={() => setIsModalVisible(true)}>
          You can also connect&nbsp;
          <WalletContainer>
            with&nbsp;
            <WalletName icon={trezorIcon}>Trezor</WalletName>&nbsp;
            or&nbsp;&nbsp;
            <WalletName icon={ledgerIcon}>Ledger</WalletName>
          </WalletContainer>
        </ConnectLabel>
      </ConnectionBlock>

      <Modal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <TrezorLedgerInstruction/>
      </Modal>
    </>
  );
};

const ConnectLabel = styled.a`
  font-weight: 300;
  display: flex;
  flex-wrap: wrap;
  font-size: 14px;
  color: #181EA9;
  cursor: pointer;
  text-decoration: underline;
`;

const WalletContainer = styled.div`
  display: flex;
  height: 14px;
`;

const MetaMaskButton = styled(ButtonSecondary)`
  margin: 16px 0;
  max-width: 270px;
  height: 48px;
  font-size: 14px;
  line-height: 16px;
  font-weight: bold;
  justify-content: flex-start;

  & img {
    max-width: 40px;
    margin-right: 16px;
  }

  @media(max-width: 500px) {
    max-width: initial;
    justify-content: center;
  }
`;

const InfoRow = styled.div`
  height: 36px;
`;

const StyledText = styled(Text)`
  margin: 24px 0 32px;
`;

const Link = styled.a`
  display: flex;
  flex-wrap: no-wrap;
  color: inherit;
`;

const ConnectionBlock = styled.div`
  margin-top: 162px;
`;
