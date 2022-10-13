import { configureLocalState } from './src/react/configure';
import { LocalState } from './src/LocalState';
import { 
  LocalStateMultiGetters,
  LocalStateMultiSetters,
  LocalStateMultiRemovers,
  LocalStateMulti,
 } from './src/types';
import { LocalStateBackend } from './src/LocalStateBackend';
import { LocalStateMemoryBackend } from './src/backends/LocalStateMemoryBackend';

export { 
  configureLocalState,
  LocalState,
  LocalStateMultiGetters,
  LocalStateMultiSetters,
  LocalStateMultiRemovers,
  LocalStateMulti,
  LocalStateBackend, 
  LocalStateMemoryBackend,
 };