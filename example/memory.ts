import { LocalState } from '../src/LocalState';
import { LocalStateMemoryBackend } from '../src/backends/LocalCache';

interface Keys {
  key1: number,
  key2: boolean,
}

const localState = new LocalState<Keys>(new LocalStateMemoryBackend<Keys>());

localState.set('key1', 123)
  .then(() => console.log('Stored value'))
  .then(() => {
    localState.get('key1')
      .then((value) => console.log('Read value', value));
  });