import React from 'react';
import styled from 'styled-components';
import whiteArrow from '../assets/icons/arrow-white.svg';
import totop from '../assets/icons/totop.svg';

export const Footer = () => (
  <FooterBackground>
    <FooterBlock>
      <FooterContainer>
        <div>
          <ToTop
            data-action="scroll"
            onClick={() => window.scrollTo({top: 0, left: 0, behavior: 'smooth'})}
          >
            <ToTopArrow src={totop}/>
              TO TOP
          </ToTop>
          <ContactTable>contact golem</ContactTable>
        </div>
        <TableWithArrows>
          <ArrowCell href="http://chat.golem.network/" target='_blank' rel="noopener noreferrer">
            <ContactCell>Support Chat</ContactCell>
            <img alt='Navigate to golem network chat' src={whiteArrow}/>
          </ArrowCell>
          <ArrowCell href="https://twitter.com/golemproject" target='_blank' rel="noopener noreferrer">
            <ContactCell>Twitter</ContactCell>
            <img alt='Navigate to Golem Twitter profile' src={whiteArrow}/>
          </ArrowCell>
          <ArrowCell href="https://www.reddit.com/r/GolemProject/" target='_blank' rel="noopener noreferrer">
            <ContactCell>Reddit</ContactCell>
            <img alt='Navigate to Golem Reddit profile' src={whiteArrow}/>
          </ArrowCell>
          <ArrowCell href="https://blog.golemproject.net/?gi=9ae7ace74474" target='_blank' rel="noopener noreferrer">
            <ContactCell>Golem blog</ContactCell>
            <img alt='Navigate to Golem blog' src={whiteArrow}/>
          </ArrowCell>
        </TableWithArrows>
        <Button href="mailto:contact@golem.network" target="_blank" rel="noopener noreferrer">
            Email Golem
        </Button>
        <Copyright>
          <p>Copyright © 2020 Golem Factory GmbH</p>
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
  font-family: AktivGroteskEx;
  font-weight: normal;
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

  p {
    transition: all 0.2s ease;
  }

  img {
    transition: all 0.2s ease;
  }

  &:hover {
    p {
      transform: translateY(15px);
    }

    img {
      transform: translateX(15px);
    }
  }
  @media (max-width: 900px) {
    width: auto;
  }
`;

const ToTop = styled.a`
  display: flex;
  flex-direction: row-reverse;
  color: #fff;
  font-size: 10px;
  letter-spacing: .2em;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
   transform: translateY(-5px);
  }
`;

const Button = styled.a`
  width: 378px;
  font-size: 14px;
  padding: 1.44em 0;
  margin: 3em 0;
  max-width: 100%;
  border: solid 1px #fff;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: .2em;
  display: inline-block;
  color: #fff;
  transition: all 0.2s ease;
  text-decoration: none;
  &:hover {
    background: #fff;
    color: #181EA9;
  }
`;


const Copyright = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 40px;
  color: #fff;
  font-size: 12px;
`;
