import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import { useStore } from './hooks/useStore.js';
import { useDispatch } from './hooks/useDispatch.js';

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

const Button = (props: ButtonProps) => (
  <button
    {...props}
    className="px-4 py-1 border-2 border-gray-800 rounded hover:bg-gray-800 hover:text-white focus-visible:bg-gray-800 focus-visible:text-white"
  />
);

export const App = () => {
  const counter = useStore((x) => x.counter);
  const dispatch = useDispatch();
  const onDecrement = () => dispatch('COUNTER:DECREMENT');
  const onIncrement = () => dispatch('COUNTER:INCREMENT');
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <Button onClick={onDecrement}>decrement</Button>
      <pre>{counter ?? 'loading'}</pre>
      <Button onClick={onIncrement}>increment</Button>
    </main>
  );
};
