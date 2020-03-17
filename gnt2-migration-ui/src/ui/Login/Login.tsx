import React, {useState} from 'react';
import styled from 'styled-components';
import {useServices} from '../hooks/useServices';
import {RouteComponentProps} from 'react-router-dom';
import {ConnectionState} from '../../services/ConnectionService';
import {DashboardLayout} from '../commons/DashboardLayout/DashboardLayout';
import {MainTitle} from '../commons/Text/MainTitle';
import {Text} from '../commons/Text/Text';
import {Checkbox} from '../commons/Form/Checkbox';
import {BlockTitle} from '../commons/Text/BlockTitle';
import {ButtonSecondary} from '../commons/Buttons/ButtonSecondary';
import {InfoBlock} from '../commons/InfoBlock';
import metamaskIcon from '../../assets/icons/metamask.svg';
import trezorIcon from '../../assets/icons/trezor.svg';
import ledgerIcon from '../../assets/icons/ledger.svg';
import {Modal} from '../Modal';
import {TrezorLedgerInstruction} from './TrezorLedgerInstruction';

export const Login = ({history}: RouteComponentProps) => {
  const [isChecked, setIsChecked] = useState(false);
  const {connectionService} = useServices();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onMetamaskClick = async () => {
    await connectionService.connect();
    if (connectionService.connectionState === ConnectionState.CONNECTED) {
      history.push('/account');
    }
  };

  return (
    <DashboardLayout title="WELCOME TO">
      <MainTitle>Golem token migrator</MainTitle>
      <StyledText>Use Token Migrator to move your GNT into new version. Connect your wallet to view available migrations on your account.</StyledText>
      <Checkbox
        value={isChecked}
        onChange={setIsChecked}
        label={<>Lorem ipsum dolor sit amet enim etiam <Link href="">Terms and Conditions</Link>.</>}
      />
      <ConnectionBlock>
        <BlockTitle>Connect to:</BlockTitle>
        <ButtonsRow>
          <MetaMaskButton onClick={onMetamaskClick}>
            <img src={metamaskIcon} alt="metamask logo"/> MetaMask
          </MetaMaskButton>
          <TextSeparator>OR</TextSeparator>
          <ConnectButton onClick={() => setIsModalVisible(true)}>
            <WalletName icon={trezorIcon}>Trezor</WalletName>
            <WalletName icon={ledgerIcon}>Ledger</WalletName>
          </ConnectButton>
        </ButtonsRow>
        <InfoBlock>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vehicula vehicula odio, ut scelerisque massa.Learn more</InfoBlock>
      </ConnectionBlock>
      <Modal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <TrezorLedgerInstruction/>
      </Modal>
    </DashboardLayout>
  );
};

interface WalletNameProps {
  icon: string;
  children: string;
}

const WalletName = ({icon, children}: WalletNameProps) => (
  <WalletNameRow>
    <img src={icon}/>
    <WalletNameText>{children}</WalletNameText>
  </WalletNameRow>
);

const WalletNameRow = styled.div`
  display: flex;
  align-items: center;

  & + & {
    margin-left: 23px;
  }
`;

const WalletNameText = styled.p`
  margin-left: 10px;
  font-size: 14px;
  line-height: 16px;
  letter-spacing: 2px;
  color: #1722A2;
`;

const ConnectButton = styled(ButtonSecondary)`
  max-width: 270px;
  height: 48px;
  font-size: 14px;
  line-height: 16px;
  font-weight: bold;
`;

const MetaMaskButton = styled(ConnectButton)`
  justify-content: flex-start;  

  & img {
    max-width: 40px;
    margin-right: 16px;
  }
`;

const StyledText = styled(Text)`
  margin: 24px 0 32px; 
`;

const Link = styled.a`
  color: inherit;
`;

const ConnectionBlock = styled.div`
  margin-top: 162px;
`;

const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  margin: 16px 0;
`;

const TextSeparator = styled(BlockTitle)`
  margin: 0 12px;
`;
