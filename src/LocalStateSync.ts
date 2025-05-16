import { LocalStateBackend } from './LocalStateBackend';
import { LocalStateBase } from './LocalStateBase';
import { 
  LocalStateMultiGetters,
} from './types';

export type LocalStateSyncLoadedCallback = (loading: boolean) => void

/**
 * Abstraction layer over key/value persisted data working in the 
 * synchronous mode.
 */
export class LocalStateSync<KeysType> extends LocalStateBase<KeysType> {
  private backend: LocalStateBackend;
  private cache = new Map<string, any>();
  private loading: boolean = true;
  private loadingSubscribers = new Map<number, LocalStateSyncLoadedCallback>();
  private lastLoadingSubscriberId = 0;

  constructor(backend: LocalStateBackend) {
    super();
    this.backend = backend;    
  }

  /**
   * Loads all values present in the backend and stores them in the memory 
   * cache.
   * 
   * Subsequent calls do not load them again until force is set to true.
   * 
   * @param force set to true to force reload if data was loaded
   * @returns A promise that resolves once loading is done 
   */
  async load(force: boolean = false): Promise<void> {
    if(this.loading || force) {
      this.loading = true;
      for(let subscriberCallback of this.loadingSubscribers.values()) {
        subscriberCallback(true);
      }
      const keys = await this.backend.list();
      const values = await this.backend.multiGet(keys);
      for(const key of Object.keys(values)) {
        this.cache.set(key, values[key]);
        this.notifyValue(key as any, values[key]);
      }
      this.loading = false;
      for(let subscriberCallback of this.loadingSubscribers.values()) {
        subscriberCallback(false);
      }
    }
  }

  /**
   * Returns information whether loading is in progress.
   * 
   * @returns true if loading is in progress
   */
  isLoading(): boolean {
    return this.loading;
  }

  /**
   * Subscribes to loading status changes.
   * 
   * @param callback callback invoked when loading status changes 
   * @returns subscriber ID
   */
  subscribeLoading(callback: LocalStateSyncLoadedCallback): number {
    const subscriberId = ++this.lastLoadingSubscriberId;
    this.loadingSubscribers.set(subscriberId, callback);
    return subscriberId;
  }

  /**
   * Unsubscribes from loading status changes.
   * 
   * @param subscriberId subscriber ID received upon subscription 
   */
  unsubscribeLoading(subscriberId: number) {
    if(!this.loadingSubscribers.has(subscriberId)) {
      throw new Error(`Trying to unsubscribe from a loading callback with invalid subscriber ID ${subscriberId}`);
    }
    this.loadingSubscribers.delete(subscriberId);
  }

  /**
   * Removes a single key.
   * 
   * @param key A key to be removed. 
   */
  remove<Key extends string & keyof KeysType>(key: Key): Promise<void> {
    this.cache.delete(key);
    this.notifyValue(key, undefined);    
    return this.backend.remove(key);
  }
  
  /**
   * Reads a single key.
   * 
   * @param key A key to be read. 
   * @returns A value or undefined if key was not found or not loaded yet.
   */
  get<Key extends string & keyof KeysType>(key: Key): KeysType[Key] | undefined {
    return this.cache.get(key);
  }

  /**
   * Reads multiple keys in a single call.
   * 
   * @param keys List of keys to be read.
   * @returns An object where keys are retreived keys and values 
   * are read values. Value is undefined if key was not found or
   * not loaded yet.
   */
  multiGet<Key extends string & keyof KeysType>(keys: Key[]): LocalStateMultiGetters<KeysType> {
    const result: LocalStateMultiGetters<KeysType> = {} as LocalStateMultiGetters<KeysType>;
    for(const key of keys) {
      result[key] = this.cache.get(key);
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
  set<Key extends string & keyof KeysType>(key: Key, value: KeysType[Key]): Promise<void> {
    this.cache.set(key, value);
    this.notifyValue(key, value);
    return this.backend.set(key, value);
  }
}