import { LocalStateMultiGetters } from './types';

/**
 * An interface for implementing platform-specific storage backends.
 */
 export interface LocalStateBackend {
  /**
   * Reads all keys present in the underlying storage.
   *
   * @returns a promise that resolves once keys is read
  */
  list(): Promise<readonly string[]>

  /**
   * Removes a key stored in the underlying storage.
   * 
   * If key was not present, does nothing.
   * 
   * @param key key to be removed
   * @returns a promise that resolves once data is removed
   */
  remove(key: string): Promise<void>

  /**
   * Reads a value associated with the key stored in the
   * underlying storage.
   * 
   * The promise will resolve with a value that is any valid 
   * value that can be deserialized from JSON. If your backend
   * supports different types of serialization, and you know
   * what you are doing, you can pass other values as well but 
   * then you will lose some interoperability between backends.
   * 
   * If key was not present, the promise returns undefined.
   * 
   * @param key key to be read
   * @returns a promise that resolves once data is read
   */
  get(key: string): Promise<any>

  /**
   * Saves a value and associates it with the given key in 
   * the underlying storage.
   * 
   * The value is any valid value that can be serialized to
   * JSON. If your backend supports different types of 
   * serialization, and you know what you are doing, you can 
   * pass other values as well but then you will lose some 
   * interoperability between backends.
   * 
   * @param key key to be saved
   * @param value value to be saved
   * @returns a promise that resolves once data is persisted
   */
  set(key: string, value: any): Promise<void>

  /**
   * Reads multiple values associated with given keys in the
   * underlying storage.
   * 
   * Works similarly to get.
   * 
   * @param keys keys to be read 
   * @returns a promise that resolves once data is read
   */
  multiGet(keys: readonly string[]): Promise<LocalStateMultiGetters<any>>
}