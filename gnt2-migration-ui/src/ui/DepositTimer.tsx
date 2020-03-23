import React, {useEffect, useState} from 'react';
import {useAsync} from './hooks/useAsync';
import {useServices} from './hooks/useServices';
import {useProperty} from './hooks/useProperty';
import {DepositState} from '../services/TokensService';
import {Timer} from './commons/Timer';
import clockIcon from '../assets/icons/clock.svg';
import styled from 'styled-components';

export const DepositTimer = () => {
  const {tokensService, connectionService, contractAddressService, refreshService} = useServices();
  const account = useProperty(connectionService.account);
  const contractAddresses = useProperty(contractAddressService.contractAddresses);

  const depositState = useProperty(tokensService.depositLockState);
  const [timeLeft] = useAsync(async () => tokensService.getDepositUnlockTime(account), [contractAddresses, account]);
  const [timer, setTimer] = useState<string | undefined>(undefined);
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    setTimer('');
    let timerId: number;
    if (depositState === DepositState.TIME_LOCKED) {
      if (timeLeft) {
        timerId = Timer(timeLeft.toNumber() * 1000, setTimer);
      }
    }
    return () => { if (timerId) { clearInterval(timerId); } };
  }, [timeLeft, depositState, account, contractAddresses]);


  if (!flag && timer === '00:00:00') {
    refreshService.refresh();
    setFlag(true);
  }

  return (
    <Row>
      {timer &&
        <>
          <ClockIcon src={clockIcon} alt="clock"/>
          <Time data-testid='deposit-timer'>{timer}</Time>
        </>
      }
    </Row>
  );
};

const Row = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 32px;
  width: 148px;
  height: 40px;
`;

const ClockIcon = styled.img`
  margin-right: 19px;
`;

const Time = styled.p`
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #1722A2;
`;
