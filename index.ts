import { configureLocalState } from './src/react/configure';
import { LocalState, LocalStateMultiReadResult } from './src/LocalState';
import { LocalStateBackend } from './src/LocalStateBackend';
import { LocalStateMemoryBackend } from './src/backends/LocalStateMemoryBackend';

export { 
  configureLocalState,
  LocalState,
  LocalStateMultiReadResult,
  LocalStateBackend, 
  LocalStateMemoryBackend,
 };