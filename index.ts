import { configureLocalState } from './src/react/configure';
import { LocalStateAsync } from './src/LocalStateAsync';
import { LocalStateSync } from './src/LocalStateSync';
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
  LocalStateSync,
  LocalStateAsync,
  LocalStateMultiGetters,
  LocalStateMultiSetters,
  LocalStateMultiRemovers,
  LocalStateMulti,
  LocalStateBackend, 
  LocalStateMemoryBackend,
 };