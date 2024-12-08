import { useDispatch } from 'zutron';

import { useStore } from './hooks/useStore.js';
import type { AppState } from '../features/index.js';

export const App = () => {
  const counter = useStore((x: AppState) => x.counter);
  const dispatch = useDispatch(window.zutron);

  return (
    <main>
      <button type="button" onClick={() => dispatch('COUNTER:DECREMENT')}>
        decrement
      </button>
      <pre>{counter ?? 'loading...'}</pre>
      <button type="button" onClick={() => dispatch('COUNTER:INCREMENT')}>
        increment
      </button>
    </main>
  );
};
