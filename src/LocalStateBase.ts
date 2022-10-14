type SubscriberRegistry<KeysType> = {
  [Key in keyof KeysType]?: Map<number, (newValue: KeysType[Key] | undefined) => void>
}

export abstract class LocalStateBase<KeysType> {
  private subscribers: SubscriberRegistry<KeysType> = {};
  private lastSubscriberId = 0;
  
  protected notify<Key extends string & keyof KeysType>(key: Key, value: KeysType[Key] | undefined): void {
    if(this.subscribers.hasOwnProperty(key)) {
      for(const callback of this.subscribers[key]!.values()) {
        callback(value);
      }
    }
  }

  /**
   * Subscribes for changes of value associated with given key.
   * 
   * @param key A key to monitor. 
   * @param callback A callback to be called upon value change. A new value
   * will be passed as an argument to the callback.
   * @returns A subscriber ID that can be used to unsubscribe.
   */
  public subscribe<Key extends string & keyof KeysType>(key: Key, callback: (newValue: KeysType[Key] | undefined) => void): number {
    const subscriberId = ++this.lastSubscriberId;

    if(!this.subscribers.hasOwnProperty(key)) {
      this.subscribers[key] = new Map();
    }

    this.subscribers[key]!.set(subscriberId, callback);
    return subscriberId;
  }

  /**
   * Unsubscribes from changes of the value associated with the given key.
   * 
   * @param key A key to unmonitor.
   * @param subscriberId A subscriber ID that was given upon subscription.
   * @throws Error if invalid key/subscriberId combination was given. 
   */
   public unsubscribe<Key extends string & keyof KeysType>(key: Key, subscriberId: number) {
    if(!this.subscribers.hasOwnProperty(key)) {
      throw new Error(`Trying to unsubscribe from a key "${key}" that has no subscribers`);
    }

    if(!this.subscribers[key]!.has(subscriberId)) {
      throw new Error(`Trying to unsubscribe from a key "${key}" that has some subscribers but no subscriber with given ID ${subscriberId}`);
    }

    this.subscribers[key]!.delete(subscriberId);
    if(this.subscribers[key]!.size === 0) {
      delete this.subscribers[key];
    }
  }
}