import React from 'react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { screen, render, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { createStore, createUseStore, type Handlers, useDispatch } from '../src/index.js';

describe('createUseStore', () => {
  type TestState = { testCounter: number };

  it('should return a store hook', async () => {
    const handlers = {
      dispatch: vi.fn(),
      getState: vi.fn().mockResolvedValue({ testCounter: 0 }),
      subscribe: vi.fn().mockImplementation((fn) => fn({ testCounter: 0 })),
    };
    const useStore = createUseStore<TestState>(handlers);
    const TestApp = () => {
      const testCounter = useStore((x) => x.testCounter);

      return (
        <main>
          counter: <span data-testid="counter">{testCounter}</span>
        </main>
      );
    };

    await waitFor(() => setTimeout(() => render(<TestApp />), 0));

    expect(screen.getByTestId('counter')).toHaveTextContent('0');
  });
});

describe('createDispatch', () => {
  type TestState = { testCounter: number; setCounter: (counter: TestState['testCounter']) => void };

  const state = { testCounter: 0 };
  let handlers: Record<string, Mock>;

  beforeEach(() => {
    state.testCounter = 0;
    handlers = {
      dispatch: vi.fn().mockImplementation((action, payload) => {
        store.setState((state) => {
          state.testCounter = action.payload || payload?.testCounter || payload;
          return state;
        });
      }),
      getState: vi.fn().mockResolvedValue(state),
      subscribe: vi.fn().mockImplementation((fn) => fn(state)),
    };
    const store = createStore<TestState>(handlers as unknown as Handlers<TestState>);
  });

  it('should create a dispatch hook which can handle thunks', async () => {
    const TestApp = () => {
      const dispatch = useDispatch<TestState>(handlers as unknown as Handlers<TestState>);
      return (
        <main>
          <button
            type="button"
            onClick={() =>
              dispatch((getState, dispatch) => {
                const { testCounter } = getState();
                dispatch('TEST:COUNTER:THUNK', testCounter + 2);
              })
            }
          >
            Dispatch Thunk
          </button>
        </main>
      );
    };

    render(<TestApp />);
    await waitFor(() => setTimeout(() => {}, 0));

    fireEvent.click(screen.getByText('Dispatch Thunk'));
    expect(handlers.dispatch).toHaveBeenCalledWith('TEST:COUNTER:THUNK', 2);
    fireEvent.click(screen.getByText('Dispatch Thunk'));
    expect(handlers.dispatch).toHaveBeenCalledWith('TEST:COUNTER:THUNK', 4);
    fireEvent.click(screen.getByText('Dispatch Thunk'));
    expect(handlers.dispatch).toHaveBeenCalledWith('TEST:COUNTER:THUNK', 6);
  });

  it('should create a dispatch hook which can handle action objects', async () => {
    const TestApp = () => {
      const dispatch = useDispatch<TestState>(handlers as unknown as Handlers<TestState>);
      return (
        <main>
          <button type="button" onClick={() => dispatch({ type: 'TEST:COUNTER:ACTION', payload: 2 })}>
            Dispatch Action
          </button>
        </main>
      );
    };

    render(<TestApp />);
    await waitFor(() => setTimeout(() => {}, 0));

    fireEvent.click(screen.getByText('Dispatch Action'));
    expect(handlers.dispatch).toHaveBeenCalledWith({ type: 'TEST:COUNTER:ACTION', payload: 2 });
  });

  it('should create a dispatch hook which can handle inline actions', async () => {
    const TestApp = () => {
      const dispatch = useDispatch<TestState>(handlers as unknown as Handlers<TestState>);
      return (
        <main>
          <button type="button" onClick={() => dispatch('TEST:COUNTER:INLINE', 1)}>
            Dispatch Inline Action
          </button>
        </main>
      );
    };

    render(<TestApp />);
    await waitFor(() => setTimeout(() => {}, 0));

    fireEvent.click(screen.getByText('Dispatch Inline Action'));
    expect(handlers.dispatch).toHaveBeenCalledWith('TEST:COUNTER:INLINE', 1);
  });
});
