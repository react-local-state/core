import { createContext } from 'react';

import { LocalState } from '../LocalState';
import { LocalStateBackend } from '../LocalStateBackend';

import { useLocalStateWithContext } from './hooks';

/**
 * A function that configures the local state to use a given backend.
 * 
 * If you are using TypeScript and you will pass the type, it will 
 * additionally ensure that returned hooks are type-aware.
 * 
 * Use that early in your code in order to initialzie the local state.
 * Put LocalStateProvider somewhere near the top in your App tree and
 * export returned useLocalState to other modules of your application.
 * 
 * @param backend instance of backend class
 * @returns an object with LocalStateProvider and useLocalState
 */
export function configureLocalState<KeysType>(backend: LocalStateBackend<KeysType>) {
  const localState = new LocalState(backend);
  const LocalStateContext = createContext<LocalState<KeysType>>(localState);

  const LocalStateProvider = ({ children }: { children: JSX.Element }): JSX.Element => (
    <LocalStateContext.Provider value={localState}>
      {children}
    </LocalStateContext.Provider>
  );

  const useLocalState = (keys: string & keyof KeysType | (string & keyof KeysType)[]) => {
    return useLocalStateWithContext(LocalStateContext, keys);
  }

  return {
    LocalStateProvider,
    useLocalState,
  };
}