import {createContext, useContext} from 'react';
import {Services} from '../services';

export const ServiceContext = createContext<Services>({} as Services);

export function useServices(): Services {
  return useContext(ServiceContext);
}
