import { LocalStateMultiGetters } from '../types';
import { LocalStateBackend } from '../LocalStateBackend';

export class LocalStateMemoryBackend implements LocalStateBackend {
  private data = new Map<string, any>();

  list(): Promise<string[]> {
    return new Promise((resolve) => {
      resolve(Array.from(this.data.keys()));
    });
  }

  remove(key: string): Promise<void> {
    this.data.delete(key);
    return new Promise((resolve) => resolve());
  }
  
  get(key: string): Promise<any> {
    return new Promise((resolve) => resolve(this.data.get(key)));
  }

  set(key: string, value: any): Promise<void> {
    return new Promise((resolve) => {
      this.data.set(key, value);
      resolve();
    });
  }

  multiGet(keys: readonly string[]): Promise<LocalStateMultiGetters<any>> {
    return new Promise((resolve) => {
      const result: LocalStateMultiGetters<any> = {};
      for(const key of keys) {
        result[key] = this.data.get(key);
      }
      resolve(result);
    });
  }  
}