import React, {useState} from 'react';
import {useServices} from '../hooks/useServices';
import {RouteComponentProps} from 'react-router-dom';
import {DashboardLayout} from '../commons/DashboardLayout/DashboardLayout';
import {LoginConnecting} from './LoginConnecting';
import {LoginSelector} from './LoginSelector';

export const Login = ({history}: RouteComponentProps) => {
  const {connectionService} = useServices();
  const [isConnecting, setIsConnecting] = useState(false);

  const onMetamaskClick = async () => {
    setIsConnecting(true);
    try {
      await connectionService.connect();
    } finally {
      setIsConnecting(false);
    }
    if (connectionService.isConnected()) {
      history.push('/account');
    }
  };

  return (
    <DashboardLayout title={isConnecting ? 'GOLEM TOKEN MIGRATOR' : 'WELCOME TO'}>
      {isConnecting
        ? <LoginConnecting/>
        : <LoginSelector onMetamaskClick={onMetamaskClick}/>}
    </DashboardLayout>
  );
};
