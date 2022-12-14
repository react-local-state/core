import { LocalStateBackend } from './LocalStateBackend';
import { LocalStateBase } from './LocalStateBase';
import { 
  LocalStateMultiGetters,
} from './types';

/**
 * Abstraction layer over key/value persisted data working in the 
 * asynchronous mode.
 */
 export class LocalStateAsync<KeysType> extends LocalStateBase<KeysType> {
  private backend: LocalStateBackend;

  constructor(backend: LocalStateBackend) {
    super();
    this.backend = backend;
  }

  /**
   * Removes a single key.
   * 
   * @param key A key to be removed 
   * @returns A promise with no value.
   */
  remove<Key extends string & keyof KeysType>(key: Key): Promise<void> {
    return this.backend.remove(key).then(() => {
      this.notifyValue(key, undefined);
    });
  }
  
  /**
   * Reads a single key.
   * 
   * @param key A key to be read. 
   * @returns A promise with a value or undefined if key was not found.
   */
  get<Key extends string & keyof KeysType>(key: Key): Promise<KeysType[Key] | undefined> {
    return this.backend.get(key);
  }

  /**
   * Reads multiple keys in a single call.
   * 
   * @param keys List of keys to be read.
   * @returns A promise with an object where keys are retreived keys and values 
   * are read values. Value is undefined if key was not found.
   */
  multiGet<Key extends string & keyof KeysType>(keys: Key[]): Promise<LocalStateMultiGetters<KeysType>> {
    return this.backend.multiGet(keys);
  }

  /**
   * Sets a single key to the given value.
   * 
   * @param key Key to be set. 
   * @param value Value to be stored.
   * @returns A promise with void value.
   */
  set<Key extends string & keyof KeysType>(key: Key, value: KeysType[Key]): Promise<void> {
    return this.backend.set(key, value).then(() => {
      this.notifyValue(key, value);
    });
  }
}