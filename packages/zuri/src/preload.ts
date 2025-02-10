import { invoke } from '@tauri-apps/api';
import { listen, Event } from '@tauri-apps/api/event';
// import { onReady } from '@tauri-apps/api/app';
import type { UnlistenFn } from '@tauri-apps/api/event';
import type { AnyState, PreloadZustandBridgeReturn } from './types.js';
import type { Action, Thunk } from './types.js';

export const preloadZustandBridge = <S extends AnyState>(): PreloadZustandBridgeReturn<S> => {
  console.log('Preload: Initializing bridge...');

  // Create a promise that resolves when commands are ready
  const readyPromise = new Promise<void>((resolve) => {
    console.log('Preload: Setting up ready listener...');
    listen<string>('tauri://core', (event) => {
      console.log('Preload: Core event:', event);
      if (event.payload === 'commands-ready') {
        console.log('Preload: Commands are ready');
        resolve();
      }
    });
  });

  const getState = async () => {
    console.log('Preload: Waiting for commands...');
    await readyPromise;
    try {
      console.log('Preload: Attempting to get state...');
      const state = await invoke<S>('zuri:get-state');
      console.log('Preload: Got state:', state);
      return state;
    } catch (err) {
      console.error('Preload: Error getting state:', err);
      throw err;
    }
  };

  const dispatch = async (action: string | Action | Thunk<S>, payload?: unknown) => {
    console.log('Preload: Waiting for commands...');
    await readyPromise;
    if (typeof action === 'function') {
      const state = await getState();
      return action(() => state, dispatch);
    }
    const eventPayload = typeof action === 'string' ? { type: action, payload } : action;
    console.log('Preload: Dispatching action:', eventPayload);
    await invoke('zuri:dispatch', { action: eventPayload });
  };

  return {
    handlers: {
      dispatch,
      getState,
      subscribe: (callback) => {
        let unlisten: UnlistenFn;
        console.log('Preload: Setting up state subscription...');
        readyPromise.then(() => {
          console.log('Preload: Commands ready, creating listener...');
          listen<S>('zuri:state-update', (event: Event<S>) => {
            console.log('Preload: State update received:', event.payload);
            callback(event.payload);
          }).then((unlistenerFn) => {
            console.log('Preload: Listener setup complete');
            unlisten = unlistenerFn;
          });
        });
        return () => unlisten?.();
      },
    },
  };
};

export type PreloadZuriBridge = typeof preloadZustandBridge;
