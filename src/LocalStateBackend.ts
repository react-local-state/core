import { LocalStateMultiGetters } from './types';

/**
 * An interface for implementing platform-specific storage backends.
 */
 export interface LocalStateBackend<KeysType> {
  remove<Key extends string & keyof KeysType>(key: Key): Promise<void>
  get<Key extends string & keyof KeysType>(key: Key): Promise<KeysType[Key]>
  set<Key extends string & keyof KeysType>(key: Key, value: KeysType[Key]): Promise<void>
  multiGet<Key extends string & keyof KeysType>(keys: Key[]): Promise<LocalStateMultiGetters<KeysType>>
}