import { LocalStateMultiReadResult } from '../LocalState';
import { LocalStateBackend } from '../LocalStateBackend';

export class LocalStateMemoryBackend<KeysType> implements LocalStateBackend<KeysType> {
  private data = new Map<string & keyof KeysType, any>();
  
  get<Key extends string & keyof KeysType>(key: Key): Promise<KeysType[Key]> {
    return new Promise((resolve) => resolve(this.data.get(key)));
  }

  set<Key extends string & keyof KeysType>(key: Key, value: KeysType[Key]): Promise<void> {
    return new Promise((resolve) => {
      this.data.set(key, value);
      resolve();
    });
  }

  multiGet<Key extends string & keyof KeysType>(keys: Key[]): Promise<LocalStateMultiReadResult<KeysType>> {
    return new Promise((resolve) => {
      const result = {};
      for(const key of keys) {
        result[this.data.get(key)] = this.data.get(key);
      }
      resolve(result);
    });
  }  
}