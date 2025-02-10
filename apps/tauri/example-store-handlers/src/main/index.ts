console.log('Main process starting...');

import { initBridge } from './store.js';

// Initialize the bridge when the app starts
initBridge().catch(console.error);
