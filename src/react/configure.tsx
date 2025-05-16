import { createContext, JSX } from 'react';

import { LocalStateMulti } from '../types';
import { LocalStateSync } from '../LocalStateSync';
import { LocalStateAsync } from '../LocalStateAsync';
import { LocalStateBackend } from '../LocalStateBackend';

import { 
  useLocalStateAsyncWithContext,
  useLocalStateSyncWithContext,
 } from './hooks';

/**
 * A function that configures the local state to use a given backend
 * in the asynchronous mode.
 * 
 * If you are using TypeScript and you will pass the type, it will 
 * additionally ensure that returned hooks are type-aware.
 * 
 * Use that early in your code in order to initialzie the local state.
 * Put LocalStateProvider somewhere near the top in your App tree and
 * export returned useLocalState to other modules of your application.
 * 
 * @param backend instance of a backend class responsible for data 
 * persistence
 * @returns an object with LocalStateProvider and useLocalState
 */
export function configureLocalStateAsync<KeysType>(backend: LocalStateBackend) {
  const localState = new LocalStateAsync<KeysType>(backend);
  const LocalStateContext = createContext<LocalStateAsync<KeysType>>(localState);

  const LocalStateProvider = ({ children }: { children: JSX.Element }): JSX.Element => (
    <LocalStateContext.Provider value={localState}>
      {children}
    </LocalStateContext.Provider>
  );

  const useLocalState = (keys: (string & keyof KeysType)[]): [LocalStateMulti<KeysType>, boolean, LocalStateAsync<KeysType>] => {
    return useLocalStateAsyncWithContext<KeysType>(LocalStateContext, keys);
  }

  return {
    LocalStateProvider,
    useLocalState,
    localState,
    LocalStateContext,
  };
}


/**
 * A function that configures the local state to use a given backend
 * in the synchronous mode.
 * 
 * Calling this will initiate loading which is required to operate
 * in the synchronous mode, although it will not wait for loading to 
 * finish. Check loading value returned from useLocalState hook to 
 * ensure that the loading has finished.
 * 
 * If you are using TypeScript and you will pass the type, it will 
 * additionally ensure that returned hooks are type-aware.
 * 
 * Use that early in your code in order to initialzie the local state.
 * Put LocalStateProvider somewhere near the top in your App tree and
 * export returned useLocalState to other modules of your application.
 * 
 * @param backend instance of a backend class responsible for data 
 * persistence
 * @returns an object with LocalStateProvider and useLocalState
 */
 export function configureLocalStateSync<KeysType>(backend: LocalStateBackend) {
  const localState = new LocalStateSync<KeysType>(backend);
  localState.load();
  const LocalStateContext = createContext<LocalStateSync<KeysType>>(localState);

  const LocalStateProvider = ({ children }: { children: JSX.Element }): JSX.Element => (
    <LocalStateContext.Provider value={localState}>
      {children}
    </LocalStateContext.Provider>
  );

  const useLocalState = (keys: (string & keyof KeysType)[]): [LocalStateMulti<KeysType>, boolean, LocalStateSync<KeysType>] => {
    return useLocalStateSyncWithContext<KeysType>(LocalStateContext, keys);
  }

  return {
    LocalStateProvider,
    useLocalState,
    localState,
    LocalStateContext,
  };
}
