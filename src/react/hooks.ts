import { useEffect, useState, useMemo, useContext ,useRef } from 'react';

import { LocalStateMulti } from '../types';
import { LocalState } from '../LocalState';

type MaybeCleanUpFn = void | (() => void);

function arrayEqual(a1: any[], a2: any[]) {
  if (a1.length !== a2.length) return false;
  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }
  return true;
}

function capitalizeFirstLetter(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * A hook that works the same as useEffect but handles properly if the 
 * dependencies are an array.
 * 
 * @param callback useEffect-like callback.
 * @param deps An array with dependencies.
 * @returns A useEffect-like hook.
 */
function useArrayEffect<T>(callback: () => MaybeCleanUpFn, deps: T[]) {
  const ref = useRef<T[]>(deps);

  if (!arrayEqual(deps, ref.current)) {
    ref.current = deps;
  }

  useEffect(callback, [ref.current]);
}

export function useLocalStateWithContext<KeysType>(
  context: React.Context<LocalState<KeysType>>, 
  keys: string & keyof KeysType | (string & keyof KeysType)[],
): [LocalStateMulti<KeysType>, boolean] {
  const localState = useContext(context);
  const [loading, setLoading] = useState(true);

  const keysArray = useMemo(() => 
    Array.isArray(keys) ? keys : [keys],
  [keys]);

  const setters = useMemo(() => keysArray.reduce((acc, key) => {
    const setterKey = `set${capitalizeFirstLetter(key)}`;
    return {...acc, [setterKey]: async (value: any) => localState.set(key, value)}; // FIXME callback should have known value type
  }, {}), [keysArray]);

  const removers = useMemo(() => keysArray.reduce((acc, key) => {
    const removerKey = `remove${capitalizeFirstLetter(key)}`;
    return {...acc, [removerKey]: async () => localState.remove(key)};
  }, {}), [keysArray]);

  const defaultGetters = useMemo(() => keysArray.reduce((acc, getterKey) => {
    return {...acc, [getterKey]: undefined};
  }, {}), [keysArray]);

  const [value, setValue] = useState(
    Object.assign({}, defaultGetters, setters, removers)
  );

  useArrayEffect(() => {
    const subscriberIds = new Map<keyof KeysType, number[]>();
    for(const key of keysArray) {
      subscriberIds.set(key, []);
    }

    for(const key of keysArray) {
      const subscriberId = localState.subscribe(key, (newValue) => {
        setValue({...value, [key] : newValue});
      });
      subscriberIds.get(key)!.push(subscriberId);
    }

    return () => {
      for(const key of keysArray) {
        for(const subscriberId of subscriberIds.get(key)!) {
          localState.unsubscribe(key, subscriberId);
        }
      }
    }
  }, keysArray);

  useArrayEffect(() => {
    (async () => {
      setLoading(true);
      const readValues = await localState.multiGet(keysArray);
      setValue(Object.assign({}, readValues, setters));
      setLoading(false);
    })();
  }, keysArray);

  return [value, loading];  
}
