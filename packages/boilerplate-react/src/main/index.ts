/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { BrowserWindow, app, ipcMain } from 'electron';
import { mainZustandBridge } from 'zutron/main';

import { getHandlers } from '../features/index.js';
import { Window } from './window/window.js';
import { store } from './store/index.js';
import { tray } from './tray/tray.js';

const mainWindow = new Window();

tray.init(store);

/**
 * Add event listeners...
 */
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.enableSandbox();
app
  .whenReady()
  .then(async () => {
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      mainWindow.create();
      mainWindow.focus();
    });

    await mainWindow.create();

    const { unsubscribe } = mainZustandBridge(ipcMain, store, [mainWindow.instance as BrowserWindow], {
      handlers: getHandlers(store),
    });

    app.on('quit', unsubscribe);

    mainWindow.focus();
    tray.create();
  })
  // eslint-disable-next-line no-console
  .catch(console.error);
