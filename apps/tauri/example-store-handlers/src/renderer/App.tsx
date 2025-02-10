import React from 'react';
import { useDispatch } from 'zuri';
import { useStore, handlers } from './hooks/useStore.js';
import type { State } from '../features/index.js';

export const App: React.FC = () => {
  console.log('App component rendering');
  const counter = useStore((x: State) => x.counter);
  const dispatch = useDispatch(handlers);

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
