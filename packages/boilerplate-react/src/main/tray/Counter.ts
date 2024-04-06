import { MenuItemConstructorOptions } from 'electron';

import type { Handlers, State } from '../../features/index.js';

export const TrayCounter = (state: Partial<State>, handlers: Handlers): MenuItemConstructorOptions[] => {
  return [
    {
      label: 'decrement',
      type: 'normal',
      click: () => handlers['COUNTER:DECREMENT'](),
    },
    {
      label: `state: ${state.counter ?? 'loading'}`,
      type: 'normal',
      click: () => handlers['COUNTER:DECREMENT'](),
    },
    {
      label: 'increment',
      type: 'normal',
      click: () => handlers['COUNTER:INCREMENT'](),
    },
  ];
};
