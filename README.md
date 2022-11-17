# react-local-state

A key-value storage abstraction layer for React & React Native. 

Works out of the box with Expo in managed workflow.

## Rationale

First of all, using APIs sucha as AsyncStorage directly has poor
developer experience. There's no typing if you are using TypeScript,
no easy mechanism to subscribe for value changes etc.

Secondly, in many cases you want a synchronous API for storing local
data, such as local user settings and the underlying platform does
not provide one.

Finally, some persistence APIs does not provide a good hooks API.

This library aims at bridging this gap.

Moreover, using an abstraction layer allows to use different storage 
backends on different platforms while maintaining uniform API for the 
rest of  the application.

## Features

* both asynchronous and synchronous operation modes for read operations,
* pluggable persistency backends,
* built-in pub/sub mechanism for notifying about value changes within 
  your app,
* both promise-based and hook API,
* uses typing while using TypeScript.

### Modes

It can be set to operate asynchronously (default) or synchronously.

If set to operate asynchronously:
- both get and set/remove operations will run asynchronously,
- no data will be stored in memory cache.

That is the default behaviour. However, it might might make your app
logic more complicated as components will often have to wait for the 
read operation to finish before rendering something meaningful. That
can introduce delays of flickering if not handled properly.

If set to operate synchronously:
- get operations will run synchronously, and set/remove operations
  will still run asynchronously. The data passed to set operations 
  will be immediately stored in the cache and available to subsequent
  get requests. Returned promise will only inform that the data was 
  persisted,
- all data is being read and cached in memory upon initialization.

That will make your components' logic simpler but keep in mind that 
memory usage might be an issue if you are storing many values.

In both cases, the hooks have the same API.

## Backends

Currently the only published backend is based on 
react-native-async-storage/async-storage. It works with flawlessly 
with Expo without ejecting from managed workflow.


## Sample usage

Create `localState.ts`:

```ts
import { configureLocalStateSync } from 'react-local-state';
import { LocalStateBackendReactNativeAsyncStorage } from 'react-local-state-backend-rn-async';

interface Keys {
  isOnboardingDone: boolean,
  userId: string,
};

const {
  LocalStateProvider,
  useLocalState
} = configureLocalStateSync<Keys>(new LocalStateBackendReactNativeAsyncStorage());

export {
  LocalStateProvider,
  useLocalState
};
```

Use `configureLocalStateAsync` instead of `configureLocalStateSync` if 
you want to use it in the asynchronous mode.

That will export both provider and hook that can is typed according
given `Keys`. 

Then somewhere high in your component hierarchy use the provider:

```tsx
import { LocalStateProvider } from './localState';

export default function App() {
  return (
    <LocalStateProvider>
      <RestOfTheApp />
    </LocalStateProvider>
  );
}
```

And voila, you can just use the hook in your components:

```tsx
import { useLocalState } from './localState';

export default MyComponent() {
  const [{
    userId, 
    setUserId, 
    removeUserId
  }, loading] = useLocalState(['userId']);

  // more code...
}
```

# Author

Marcin Lewandowski

# License

MIT