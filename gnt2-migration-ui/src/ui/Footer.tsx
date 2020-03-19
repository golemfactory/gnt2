import React from 'react';
import styled from 'styled-components';
import whiteArrow from '../assets/icons/arrow-white.svg';
import totop from '../assets/icons/totop.svg';

export const Footer = () => (
  <FooterBackground>
    <FooterBlock>
      <FooterContainer>
        <div>
          <ToTop href="#topSectionID">
            <ToTopArrow src={totop}/>
            TO TOP
          </ToTop>
          <ContactTable>contact golem</ContactTable>
        </div>
        <TableWithArrows>
          <ArrowCell href="http://chat.golem.network/">
            <ContactCell>Support Chat</ContactCell>
            <img src={whiteArrow}/>
          </ArrowCell>
          <ArrowCell href="https://twitter.com/golemproject">
            <ContactCell>Twitter</ContactCell>
            <img src={whiteArrow}/>
          </ArrowCell>
          <ArrowCell href="https://www.reddit.com/r/GolemProject/">
            <ContactCell>Reddit</ContactCell>
            <img src={whiteArrow}/>
          </ArrowCell>
          <ArrowCell href="https://blog.golemproject.net/?gi=9ae7ace74474">
            <ContactCell>Golem blog</ContactCell>
            <img src={whiteArrow}/>
          </ArrowCell>
        </TableWithArrows>
        <Button>
          Email Golem
        </Button>
        <ContactTable>Map</ContactTable>
        <ContactTable>
          <TableMap>
            <TableMapCell>GOLEM.NETWORK</TableMapCell>
            <TableMapCell>Brass Beta</TableMapCell>
            <TableMapCell>TEAM</TableMapCell>
            <TableMapCell>Unlimited</TableMapCell>
            <TableMapCell>Careers</TableMapCell>
            <TableMapCell>DOCUMENTATION</TableMapCell>
            <TableMapCell>PRIVACY POLICY</TableMapCell>
            <TableMapCell>Press Kit</TableMapCell>
            <TableMapCell>CROWDFUNDING</TableMapCell>
          </TableMap>
        </ContactTable>
        <ContactTable>WHITEPAPER</ContactTable>
        <Copyright>
          <p>Copyright © 2020 Golem Factory GmbH</p>
          <CopyrightText>Made with The Codein</CopyrightText>
        </Copyright>
      </FooterContainer>
    </FooterBlock>
  </FooterBackground>
);

const ToTopArrow = styled.img`
  width: 32px;
  height: 16px;
  margin-left: 5px;
  transform: rotate(180deg);
`;

const FooterBackground = styled.footer`
  background: #181EA9;
`;

const FooterBlock = styled.div`
  max-width: 1230px;
  margin: 0 auto;
  padding: 32px 30px 0;
`;

const FooterContainer = styled.div`
  width: 100%;
  padding: 80px 0 40px 0;
  z-index: 2;
`;

const ContactTable = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  font-size: 12px;
  padding-bottom: 1.2em;
  padding-top: 1.2em;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: .2em;
`;

const TableWithArrows = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 40px;
`;

const ContactCell = styled.p`
  font-size: 18px;
  transition: all 0.3s;
  font-size: 24px;
  margin-top: 1.2em;
  margin-bottom: 1.2em;
  font-weight: 700;
  color: #fff;
`;

const ArrowCell = styled.a`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-decoration: none;
  width: 25%;
  &:hover{
    p {
      transition: all 0.3s ease;
      transform: translateY(15px);
    }
    img {
      transition: all 0.3s ease;
      transform: translateX(15px);
    }
  }
  @media (max-width: 900px) {
    width: auto;
  }
`;

const Button = styled.a`
  width: 378px;
  font-size: 14px;
  padding: 1.44em 0;
  margin: 1.2em 0;
  max-width: 100%;
  border: solid 1px #fff;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: .2em;
  display: inline-block;
  color: #fff;
  &:hover {
    background: #fff;
    color: #181EA9;
  }
`;

const ToTop = styled.a`
  display: flex;
  flex-direction: row-reverse;
  color: #fff;
  font-size: 10px;
  letter-spacing: .2em;
  text-decoration: none;
`;

const TableMap = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
`;
const TableMapCell = styled.div`
  flex: 0 50%;
  padding-top: 1.2em;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: .2em;
  display: block;
  text-transform: uppercase;
  font-size: 12px;

  &:hover {
    padding-right: 0;
    padding-left: 20px;
    transform: translateY(5px);
    transition-duration: 0.3s;
    transition-timing-function: ease;
    transition-delay: 0s;
  }
`;

const Copyright = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 40px;
  color: #fff;
  font-size: 12px;
`;

const CopyrightText = styled.p`
  font: bold;
`;
