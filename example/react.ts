import { LocalStateMemoryBackend } from '../src/backends/LocalStateMemoryBackend';
import { configureLocalStateAsync } from '../src/react/configure';

interface Keys {
  key1: number,
  key2: boolean,
}

const { LocalStateProvider, useLocalState } = configureLocalStateAsync<Keys>(new LocalStateMemoryBackend());
export { LocalStateProvider, useLocalState };

