import path from 'node:path';
import { BrowserWindow, type BrowserWindowConstructorOptions, app, ipcMain } from 'electron';

import { mainZustandBridge } from 'zutron/main';
import 'wdio-electron-service/main';

import { rootReducer } from '../features/index.js';
import { store } from './store.js';
import { tray } from './tray/index.js';

const icon = path.join(__dirname, '..', '..', 'resources', 'images', 'icon.png');

const windowOptions: BrowserWindowConstructorOptions = {
  show: false,
  icon,
  title: 'zutron',
  width: 256,
  height: 256,
  webPreferences: {
    contextIsolation: true,
    scrollBounce: true,
    sandbox: true,
    nodeIntegration: false,
    preload: path.join(__dirname, '..', 'preload', 'index.cjs'),
  },
};

let mainWindow: BrowserWindow;

function initMainWindow() {
  if (mainWindow) {
    mainWindow.show();
    return;
  }

  mainWindow = new BrowserWindow(windowOptions);

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', () => {
    mainWindow.destroy();
  });
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(async () => {
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      initMainWindow();
      mainWindow.focus();
    });

    initMainWindow();

    // Initialize the system tray
    tray.init(store, mainWindow);

    // Set the badge count to the current counter value
    store.subscribe((state) => app.setBadgeCount(state.counter ?? 0));

    const { unsubscribe } = mainZustandBridge(ipcMain, store, [mainWindow], {
      reducer: rootReducer,
    });

    app.on('quit', () => {
      tray.destroy();
      unsubscribe();
    });

    app.focus({ steal: true });
    mainWindow.focus();
  })
  .catch(console.error);
