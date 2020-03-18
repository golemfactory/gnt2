import React, {useState} from 'react';
import {Modal} from '../Modal';
import {TrezorLedgerInstruction} from './TrezorLedgerInstruction';
import {MainTitle} from '../commons/Text/MainTitle';
import {BlockTitle} from '../commons/Text/BlockTitle';
import styled from 'styled-components';
import {Text} from '../commons/Text/Text';
import {ButtonSecondary} from '../commons/Buttons/ButtonSecondary';
import {Checkbox} from '../commons/Form/Checkbox';
import metamaskIcon from '../../assets/icons/metamask.svg';
import trezorIcon from '../../assets/icons/trezor.svg';
import ledgerIcon from '../../assets/icons/ledger.svg';
import {InfoBlock} from '../commons/InfoBlock';
import {WalletName} from './WalletName';

export interface LoginSelectorProps {
  onMetamaskClick: () => void;
}

export const LoginSelector = ({onMetamaskClick}: LoginSelectorProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <>
      <MainTitle>Golem token migrator</MainTitle>
      <StyledText>
        Use Token Migrator to move your GNT into new version. Connect your wallet to view available migrations on your
        account.
      </StyledText>
      <Checkbox
        value={isChecked}
        onChange={setIsChecked}
        label={
          <>
            Lorem ipsum dolor sit amet enim etiam <Link href="">Terms and Conditions</Link>.
          </>
        }
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
        <InfoBlock>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vehicula vehicula odio, ut scelerisque
          massa.Learn more
        </InfoBlock>
      </ConnectionBlock>

      <Modal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <TrezorLedgerInstruction/>
      </Modal>
    </>
  );
};

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
