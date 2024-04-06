import { createUseStore } from 'zutron';
import { State } from '../../features/index.js';

export const useStore = createUseStore<State>(window.electron);
