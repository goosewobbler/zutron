## Accessing the Store in the Renderer Process

In the renderer process you should now be able to access the store via the `useStore` hook you just created:

```ts
import { useStore } from '../hooks/useStore.js';

const counter = useStore((x) => x.counter);
```

The `useDispatch` hook can be used to dispatch actions and thunks to the store:

```ts
import { useDispatch } from 'zutron';

const dispatch = useDispatch(window.zutron);
const onIncrement = () => dispatch('COUNTER:INCREMENT');
```

If you are using a thunk, the dispatch function and the store are passed in:

```ts
import { useDispatch } from 'zutron';

const onIncrementThunk = (getState, dispatch) => {
  // do something based on the store
  dispatch('COUNTER:INCREMENT');
};
const dispatch = useDispatch(window.zutron);
const onIncrement = () => dispatch(onIncrementThunk);
```
