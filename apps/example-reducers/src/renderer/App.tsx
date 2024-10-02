import { useStore } from './hooks/useStore.js';
import { useDispatch } from './hooks/useDispatch.js';
import type { State } from '../features/index.js';

export const App = () => {
  const counter = useStore((x: State) => x.counter);
  const dispatch = useDispatch();

  return (
    <main>
      <button onClick={() => dispatch('COUNTER:DECREMENT')}>decrement</button>
      <pre>{counter ?? 'loading...'}</pre>
      <button onClick={() => dispatch('COUNTER:INCREMENT')}>increment</button>
    </main>
  );
};
