import { createUseStore } from 'zutron';
import type { AppState } from '../../features/index.js';

export const useStore = createUseStore<AppState>(window.zutron);
