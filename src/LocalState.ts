import { LocalStateBackend } from './LocalStateBackend';

// export type LocalStateMultiReadResult<KeyType> = { [key in KeyType]?: any}
// export type LocalStateMultiSetters = { [key in LocalStateKey as `set${Capitalize<key>}`]?: (value: any) => Promise<void>}

export type LocalStateMultiReadResult<KeyType> = { };
export type LocalStateMultiSetters<KeyType> = { };

type LocalStateSubscribeCallback<KeysType, Key extends string & keyof KeysType> = (newValue: KeysType[Key]) => void

/**
 * Abstraction layer over settings stored locally on the client's device.
 * 
 * Using an abstraction layer allows to use different storage backends 
 * on different platforms while maintaining uniform API for the rest of 
 * the application.
 */
export class LocalState<KeysType> {
  private backend: LocalStateBackend<KeysType>;
  private subscribers: Map<string & keyof KeysType, Map<number, LocalStateSubscribeCallback<KeysType, string & keyof KeysType>>> = new Map();
  private lastSubscriberId = 0;

  constructor(backend: LocalStateBackend<KeysType>) {
    this.backend = backend;
  }

  /**
   * Reads a single key.
   * 
   * @param key A key to be read. 
   * @returns A promise with a value or null if key was not found.
   */
  get<Key extends string & keyof KeysType>(key: Key): Promise<KeysType[Key]> {
    return this.backend.get(key);
  }

  /**
   * Reads multiple keys in a single call.
   * 
   * @param keys List of keys to be read.
   * @returns A promise with an object where keys are retreived keys and values 
   * are read values. Value is null if key was not found.
   */
  multiGet<Key extends string & keyof KeysType>(keys: Key[]): Promise<LocalStateMultiReadResult<Key>> {
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
      if(this.subscribers.has(key)) {
        for(const callback of this.subscribers.get(key)!.values()) {
          callback(value);
        }
      }
    });
  }

  /**
   * Subscribes for changes of value associated with given key.
   * 
   * @param key A key to monitor. 
   * @param callback A callback to be called upon value change. A new value
   * will be passed as an argument to the callback.
   * @returns A subscriber ID that can be used to unsubscribe.
   */
  subscribe<Key extends string & keyof KeysType>(key: Key, callback: LocalStateSubscribeCallback<KeysType, Key>): number {
    const subscriberId = ++this.lastSubscriberId;

    if(!this.subscribers.has(key)) {
      this.subscribers.set(key, new Map<number, LocalStateSubscribeCallback<KeysType, Key>>());
    }

    this.subscribers.get(key)!.set(subscriberId, callback);
    return subscriberId;
  }

  /**
   * Unsubscribes from changes of the value associated with the given key.
   * 
   * @param key A key to unmonitor.
   * @param subscriberId A subscriber ID that was given upon subscription.
   * @throws Error if invalid key/subscriberId combination was given. 
   */
  unsubscribe<Key extends string & keyof KeysType>(key: Key, subscriberId: number) {
    if(!this.subscribers.has(key)) {
      throw new Error(`Trying to unsubscribe from a key "${key}" that has no subscribers`);
    }

    if(!this.subscribers.get(key)!.has(subscriberId)) {
      throw new Error(`Trying to unsubscribe from a key "${key}" that has some subscribers but no subscriber with given ID ${subscriberId}`);
    }

    this.subscribers.get(key)!.delete(subscriberId);
    if(this.subscribers.get(key)!.size === 0) {
      this.subscribers.delete(key);
    }
  }
}