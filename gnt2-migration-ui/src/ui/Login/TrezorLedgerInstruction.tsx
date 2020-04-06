import React from 'react';
import styled from 'styled-components';
import {Text} from '../commons/Text/Text';

export const TrezorLedgerInstruction = () => (
  <View>
    <Title>Connecting your Hardware Wallet</Title>
    <OL>
      <LI>
        <StyledText>Head over to the top-right menu on your Metamask wallet - select the &ldquo;Connect Hardware Wallet&ldquo; option.</StyledText>
      </LI>
      <LI>
        <StyledText>Plug your Ledger or Trezor device into your computer</StyledText>
      </LI>
      <LI>
        <StyledText>Select your wallet and click connect</StyledText>
      </LI>
      <LI>
        <StyledText>Select the account you want to use, then click &ldquo;Import&rdquo; and you&apos;re good to go!</StyledText>
      </LI>
    </OL>
  </View>
);

const View = styled.div`
  max-width: 570px;
  width: 100%;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-family: AktivGroteskEx;
  margin-bottom: 38px;
  font-size: 24px;
  font-weight: bold;
  line-height: 31px;
  text-align: center;
  color: #181EA9;
  font-weight: bold;
`;

const OL = styled.ol`
  list-style: decimal;
  list-style-position: inside;
`;

const LI = styled.li`
  font-size: 18px;
  line-height: 30px;
  font-weight: 500;
  color: #1722A2;
  font-weight: 500;

  & + & {
    margin-top: 24px;
  }
`;

const StyledText = styled(Text)`
  display: inline;
  font-weight: 400;
`;
