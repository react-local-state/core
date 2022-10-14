import { LocalStateBackend } from './LocalStateBackend';
import { LocalStateBase } from './LocalStateBase';
import { 
  LocalStateMultiGetters,
} from './types';

type Cache<KeysType> = {
  [Key in keyof KeysType]?: KeysType[Key] | undefined
}

/**
 * Abstraction layer over settings stored locally on the client's device.
 * 
 * Using an abstraction layer allows to use different storage backends 
 * on different platforms while maintaining uniform API for the rest of 
 * the application.
 */
export class LocalStateSync<KeysType> extends LocalStateBase<KeysType> {
  private backend: LocalStateBackend<KeysType>;
  private cache: Cache<KeysType> = {};

  constructor(backend: LocalStateBackend<KeysType>) {
    super();
    this.backend = backend;
  }

  /**
   * Removes a single key.
   * 
   * @param key A key to be removed. 
   */
  remove<Key extends string & keyof KeysType>(key: Key): void {
    delete this.cache[key];
    this.backend.remove(key);
    this.notify(key, undefined);    
  }
  
  /**
   * Reads a single key.
   * 
   * @param key A key to be read. 
   * @returns A value or undefined if key was not found.
   */
  get<Key extends string & keyof KeysType>(key: Key): KeysType[Key] | undefined {
    return this.cache[key];
  }

  /**
   * Reads multiple keys in a single call.
   * 
   * @param keys List of keys to be read.
   * @returns An object where keys are retreived keys and values 
   * are read values. Value is undefined if key was not found.
   */
  multiGet<Key extends string & keyof KeysType>(keys: Key[]): LocalStateMultiGetters<KeysType> {
    const result: LocalStateMultiGetters<KeysType> = {};
    for(const key of keys) {
      result[key] = this.cache[key];
    }
    return result;
  }

  /**
   * Sets a single key to the given value.
   * 
   * @param key Key to be set. 
   * @param value Value to be stored.
   * @returns A promise with void value.
   */
  set<Key extends string & keyof KeysType>(key: Key, value: KeysType[Key]): void {
    this.cache[key] = value;
    this.backend.set(key, value);
    this.notify(key, value);
  }
}