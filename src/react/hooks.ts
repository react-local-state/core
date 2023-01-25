import { useEffect, useState, useMemo, useContext, useRef } from 'react';

import { LocalStateMulti } from '../types';
import { LocalStateSync } from '../LocalStateSync';
import { LocalStateAsync } from '../LocalStateAsync';

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
 * dependencies are arrays.
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

export function useLocalStateSyncWithContext<KeysType>(
  context: React.Context<LocalStateSync<KeysType>>, 
  keys: (string & keyof KeysType)[],
): [LocalStateMulti<KeysType>, boolean, LocalStateSync<KeysType>] {
  const localState = useContext(context);

  // TODO check how useMemo treats the array
  const setters = useMemo(() => keys.reduce((acc, key) => {
    const setterKey = `set${capitalizeFirstLetter(key)}`;
     // FIXME callback should have known value type
    return {...acc, [setterKey]: async (value: any) => localState.set(key, value)};
  }, {}), [keys]);
  
  // TODO check how useMemo treats the array
  const removers = useMemo(() => keys.reduce((acc, key) => {
    const removerKey = `remove${capitalizeFirstLetter(key)}`;
    return {...acc, [removerKey]: async () => localState.remove(key)};
  }, {}), [keys]);

  // TODO check how useMemo treats the array
  // In sync we try to read values immediately as it might be cached
  const defaultGetters = useMemo(() => keys.reduce((acc, key) => {
    return {...acc, [key]: localState.get(key)};  
  }, {}), [keys]);

  const [value, setValue] = useState<LocalStateMulti<KeysType>>(
    Object.assign({}, defaultGetters, setters, removers)
  );

  useArrayEffect(() => {
    const subscriberIds = new Map<keyof KeysType, number[]>();
    for(const key of keys) {
      subscriberIds.set(key, []);
    }

    for(const key of keys) {
      const subscriberId = localState.subscribeValue(key, (newValue) => {
        setValue({...value, [key] : newValue});
      });
      subscriberIds.get(key)!.push(subscriberId);
    }

    return () => {
      for(const key of keys) {
        for(const subscriberId of subscriberIds.get(key)!) {
          localState.unsubscribeValue(key, subscriberId);
        }
      }
    }
  }, keys); 

  // In sync loading is initiated by the local state upon configuration
  const [loading, setLoading] = useState(localState.isLoading());
  useEffect(() => {
    const subscriberId = localState.subscribeLoading((newLoading) => {
      setLoading(newLoading);
    });

    return () => {
      localState.unsubscribeLoading(subscriberId);
    }
  }, []);

  return [value, loading, localState]; 
}

export function useLocalStateAsyncWithContext<KeysType>(
  context: React.Context<LocalStateAsync<KeysType>>, 
  keys: (string & keyof KeysType)[],
): [LocalStateMulti<KeysType>, boolean, LocalStateAsync<KeysType>] {
  const localState = useContext(context);

  // TODO check how useMemo treats the array
  const setters = useMemo(() => keys.reduce((acc, key) => {
    const setterKey = `set${capitalizeFirstLetter(key)}`;
     // FIXME callback should have known value type
    return {...acc, [setterKey]: async (value: any) => localState.set(key, value)};
  }, {}), [keys]);
  
  // TODO check how useMemo treats the array
  const removers = useMemo(() => keys.reduce((acc, key) => {
    const removerKey = `remove${capitalizeFirstLetter(key)}`;
    return {...acc, [removerKey]: async () => localState.remove(key)};
  }, {}), [keys]);

  // In async getters are undefined by default
  const defaultGetters = useMemo(() => keys.reduce((acc, key) => {
    return {...acc, [key]: undefined}; 
  }, {}), [keys]);

  const [value, setValue] = useState<LocalStateMulti<KeysType>>(
    Object.assign({}, defaultGetters, setters, removers)
  );

  useArrayEffect(() => {
    const subscriberIds = new Map<keyof KeysType, number[]>();
    for(const key of keys) {
      subscriberIds.set(key, []);
    }

    for(const key of keys) {
      const subscriberId = localState.subscribeValue(key, (newValue) => {
        setValue({...value, [key] : newValue});
      });
      subscriberIds.get(key)!.push(subscriberId);
    }

    return () => {
      for(const key of keys) {
        for(const subscriberId of subscriberIds.get(key)!) {
          localState.unsubscribeValue(key, subscriberId);
        }
      }
    }
  }, keys);

  // In async loading is initiated by hook 
  const [loading, setLoading] = useState(true);
  useArrayEffect(() => {
    (async () => {
      setLoading(true);
      const readValues = await localState.multiGet(keys);
      setValue(Object.assign({}, readValues, setters, removers));
      setLoading(false);
    })();
  }, keys);

  return [value, loading, localState];
}
