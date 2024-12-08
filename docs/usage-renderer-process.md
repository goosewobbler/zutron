## Usage in the Renderer Process

In the renderer process you should be able to access the store via the `useStore` hook:

```ts annotate
// `src/renderer/counter/index.ts`
import { useStore } from '../hooks/useStore.js';

const counter = useStore((x) => x.counter);
```

The `useDispatch` hook can be used to dispatch actions and thunks to the store:

```ts annotate
// `src/renderer/dispatch.ts`
import { useDispatch } from 'zutron';

export const dispatch = useDispatch(window.zutron);
```

```ts annotate
// `src/renderer/counter/index.ts`
import { dispatch } from '../dispatch.js';

// dispatch action
dispatch('COUNTER:INCREMENT');

const onIncrementThunk = (getState, dispatch) => {
  // do something based on the store
  ...

  // dispatch action
  dispatch('COUNTER:INCREMENT');
};

// dispatch thunk
dispatch(onIncrementThunk);
```
