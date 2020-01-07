/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect} from 'react';

type Unsubscribe = () => void | undefined;

export const useAsyncEffect = (asyncCallback: () => Promise<Unsubscribe | void | undefined>, deps?: any[]) => {
  useEffect(() => {
    const promise = asyncCallback();
    return () => {
      promise.then((unsubscribe) => unsubscribe && unsubscribe(), e => console.error(e));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
