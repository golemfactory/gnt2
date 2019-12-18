import {createContext, useContext} from 'react';
import {Services} from '../services';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ServiceContext = createContext<Services>({} as any);

export function useServices(): Services {
  return useContext(ServiceContext);
}
