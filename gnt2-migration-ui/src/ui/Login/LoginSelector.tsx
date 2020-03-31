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
import {InfoBlock} from '../commons/InfoBlock';
import {useServices} from '../hooks/useServices';
import {ConnectionState} from '../../services/ConnectionService';

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
      <MainTitle>Golem token migrator</MainTitle>
      <StyledText>
        Use Token Migrator to move your GNT into new version.<br/>Connect your wallet to view available migrations on your
        account.
      </StyledText>
      <Checkbox
        value={isChecked}
        onChange={setIsChecked}
        label={'Lorem ipsum dolor sit amet enim etiam'}
        nonClickableLabel={<><Link href="/google">Terms and Conditions</Link>.*</>}
      />
      <ConnectionBlock>
        <BlockTitle>Connect to:</BlockTitle>
        <ButtonsRow>
          <MetaMaskButton onClick={onMetamaskClick} disabled={noMetaMask || !isChecked}>
            <img src={metamaskIcon} alt="metamask logo"/> MetaMask
          </MetaMaskButton>
          <TextSeparator/>
          <ConnectButton onClick={() => setIsModalVisible(true)} disabled={!isChecked}>
            How to connect with Trezor or Ledger
          </ConnectButton>
        </ButtonsRow>
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
  border: transparent;

  @media(max-width: 500px) {
    max-width: initial;
  }
`;

// const ConnectButton = styled.a`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   max-width: 270px;
//   color: #181EA9;
//   height: 48px;
//   width: 100%;
//   font-size: 14px;
//   line-height: 16px;
//   font-weight: bold;
//   border: transparent;
//   cursor: pointer;
// `;

const MetaMaskButton = styled(ButtonSecondary)`
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
  color: inherit;
`;

const ConnectionBlock = styled.div`
  margin-top: 162px;
`;

const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  margin: 16px 0;

  @media(max-width: 500px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const TextSeparator = styled(BlockTitle)`
  margin: 0 12px;

  @media(max-width: 500px) {
    margin: 15px auto;
  }
`;
