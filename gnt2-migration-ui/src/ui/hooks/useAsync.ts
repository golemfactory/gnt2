/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState, useLayoutEffect, useRef} from 'react';

export function useAsync<T>(execute: () => Promise<T>, deps: readonly any[]): [T | undefined, any] {
  const [value, setValue] = useState<T | undefined>(undefined);
  const [error, setError] = useState<any>(undefined);
  const promise = useRef<Promise<T> | undefined>(undefined);

  useLayoutEffect(() => {
    value !== undefined && setValue(undefined);
    error !== undefined && setError(undefined);

    const p = execute();
    promise.current = p;

    p.then(
      result => promise.current === p && setValue(result),
      err => promise.current === p && setError(err),
    );

    return () => {
      promise.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [value, error];
}
