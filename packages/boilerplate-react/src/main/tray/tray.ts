import { Menu, Tray, app, nativeImage } from 'electron';

import type { State, Store } from '../../features/index.js';
import { getHandlers } from '../../features/index.js';
import image from './tray.png';
import { TrayCounter } from './Counter.js';

const trayIcon = nativeImage.createFromDataURL(image).resize({
  width: 18,
  height: 18,
});

class SystemTray {
  constructor() {
    this.instance = null;
    this.isListening = false;
  }

  private instance: Tray | null;

  private state?: State;

  private store?: Store;

  private isListening: boolean;

  private update = () => {
    if (!this.isListening) return;
    if (!this.instance) this.instance = new Tray(trayIcon);
    if (!this.state || !this.store) return;
    const handlers = getHandlers(this.store);
    const contextMenu = Menu.buildFromTemplate([
      ...TrayCounter(this.state, handlers),
      { type: 'separator' },
      { label: 'quit', click: app.quit },
    ]);

    this.instance.setToolTip('This text comes from tray module.');

    // Need to call to set Context Menu.
    this.instance.setContextMenu(contextMenu);
  };

  public create = () => {
    this.isListening = true;
    this.update();
  };

  public setState = (state: State) => {
    this.state = state;
    this.update();
  };

  public init = (store: Store) => {
    this.store = store;
    this.setState(store.getState());
    store.subscribe(() => tray.setState(store.getState()));
    this.update();
  };

  public destroy = () => {
    this.isListening = false;
    this.instance?.destroy();
    this.instance = null;
  };

  public get isVisible() {
    return !!this.instance;
  }
}

export const tray = new SystemTray();
