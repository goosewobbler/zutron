import { createUseStore } from 'zutron';
import type { State } from '../../features/index.js';

export const useStore = createUseStore<State>(window.zutron);
