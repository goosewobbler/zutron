import { vi, expect, describe, it, type Mock, beforeEach } from 'vitest';
import { preloadZustandBridge } from '../src/preload.js';
import { createIpcRendererMock } from './helpers.js';

describe('preloadZustandBridge', () => {
  it('should return the expected handlers', () => {
    const ipcRenderer = createIpcRendererMock();
    const bridge = preloadZustandBridge(ipcRenderer);

    expect(bridge.handlers).toBeDefined();
    expect(bridge.handlers.dispatch).toStrictEqual(expect.any(Function));
    expect(bridge.handlers.getState).toStrictEqual(expect.any(Function));
    expect(bridge.handlers.subscribe).toStrictEqual(expect.any(Function));
  });

  describe('handlers', () => {
    let ipcRenderer: Record<string, Mock>;
    let bridge: ReturnType<typeof preloadZustandBridge>;

    beforeEach(() => {
      ipcRenderer = createIpcRendererMock();
      bridge = preloadZustandBridge(ipcRenderer as unknown as Electron.IpcRenderer);
    });

    describe('dispatch', () => {
      it('should call ipcRenderer.send', () => {
        bridge.handlers.dispatch('action', { payload: 'data' });

        expect(ipcRenderer.send).toHaveBeenCalledWith('dispatch', 'action', { payload: 'data' });
      });
    });

    describe('getState', () => {
      it('should call ipcRenderer.invoke', () => {
        bridge.handlers.getState();

        expect(ipcRenderer.invoke).toHaveBeenCalledWith('getState');
      });
    });

    describe('subscribe', () => {
      it('should call the provided callback', () => {
        const callback = vi.fn();

        bridge.handlers.subscribe(callback);

        expect(ipcRenderer.on).toHaveBeenCalledWith('subscribe', expect.any(Function));
        ipcRenderer.on.mock.calls[0][1]('state', 'testState');
        expect(callback).toHaveBeenCalledWith('testState');
      });

      it('should return a function which unsubscribes', () => {
        const callback = vi.fn();

        const unsubscribe = bridge.handlers.subscribe(callback);
        unsubscribe();

        expect(ipcRenderer.off).toHaveBeenCalledWith('subscribe', expect.any(Function));
        ipcRenderer.off.mock.calls[0][1]('state', 'testState');
        expect(callback).toHaveBeenCalledWith('testState');
      });
    });
  });
});
