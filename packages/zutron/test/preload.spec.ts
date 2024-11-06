import { vi, expect, describe, it, beforeEach } from 'vitest';
import { createIpcRendererMock } from './helpers.js';

const mockIpcRenderer = createIpcRendererMock();

vi.mock('electron', () => ({
  ipcRenderer: mockIpcRenderer,
  default: {
    ipcRenderer: mockIpcRenderer,
  },
}));

let { preloadZustandBridge } = await import('../src/preload.js');

describe('preloadZustandBridge', () => {
  it('should return the expected handlers', () => {
    const bridge = preloadZustandBridge();

    expect(bridge.handlers).toBeDefined();
    expect(bridge.handlers.dispatch).toStrictEqual(expect.any(Function));
    expect(bridge.handlers.getState).toStrictEqual(expect.any(Function));
    expect(bridge.handlers.subscribe).toStrictEqual(expect.any(Function));
  });

  describe('handlers', () => {
    let bridge: ReturnType<typeof preloadZustandBridge>;

    beforeEach(() => {
      bridge = preloadZustandBridge();
    });

    describe('dispatch', () => {
      it('should call ipcRenderer.send', () => {
        bridge.handlers.dispatch('action', { payload: 'data' });

        expect(mockIpcRenderer.send).toHaveBeenCalledWith('dispatch', 'action', { payload: 'data' });
      });
    });

    describe('getState', () => {
      it('should call ipcRenderer.invoke', () => {
        bridge.handlers.getState();

        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('getState');
      });
    });

    describe('subscribe', () => {
      it('should call the provided callback', () => {
        const callback = vi.fn();

        bridge.handlers.subscribe(callback);

        expect(mockIpcRenderer.on).toHaveBeenCalledWith('subscribe', expect.any(Function));
        mockIpcRenderer.on.mock.calls[0][1]('state', 'testState');
        expect(callback).toHaveBeenCalledWith('testState');
      });

      it('should return a function which unsubscribes', () => {
        const callback = vi.fn();

        const unsubscribe = bridge.handlers.subscribe(callback);
        unsubscribe();

        expect(mockIpcRenderer.off).toHaveBeenCalledWith('subscribe', expect.any(Function));
        mockIpcRenderer.off.mock.calls[0][1]('state', 'testState');
        expect(callback).toHaveBeenCalledWith('testState');
      });
    });
  });
});
