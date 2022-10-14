import { LocalStateMemoryBackend } from '../src/backends/LocalStateMemoryBackend';
import { configureLocalState } from '../src/react/configure';

interface Keys {
  key1: number,
  key2: boolean,
}

const { LocalStateProvider, useLocalState } = configureLocalState<Keys>(new LocalStateMemoryBackend<Keys>()); 
export { LocalStateProvider, useLocalState };

