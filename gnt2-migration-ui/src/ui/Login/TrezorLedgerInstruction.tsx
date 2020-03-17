import React from 'react';
import styled from 'styled-components';
import {Text} from '../commons/Text/Text';

export const TrezorLedgerInstruction = () => (
  <View>
    <Title>Connect to Hardware</Title>
    <OL>
      <LI>
        <StyledText>Head to the top-right menu, and look for the &ldquo;Connect Hardware Wallet&rdquo; option</StyledText>
      </LI>
      <LI>
        <StyledText>Plug your Ledger device in to your computer.</StyledText>
      </LI>
      <LI>
        <StyledText>Select &ldquo;Ledger&rdquo;, then click &ldquo;Connect&rdquo;</StyledText>
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
  margin-bottom: 38px;
  font-size: 24px;
  font-weight: 700px;
  line-height: 31px;
  text-align: center;
  color: #181EA9;
`;

const OL = styled.ol`
  list-style: decimal;
  list-style-position: inside;
`;

const LI = styled.li`
  font-size: 18px;
  line-height: 30px;
  color: #1722A2;
  font-weight: 700;

  & + & {
    margin-top: 24px;
  }
`;

const StyledText = styled(Text)`
  display: inline;
  font-weight: 400;
`;
