import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import type { StoreApi } from 'zustand';
import type { AnyState, Handler } from '../src/types.js';

const mockIpcMain = {
  emit: vi.fn().mockImplementation((event: string, ...args: unknown[]) => {
    const calls = (mockIpcMain.on.mock.calls.filter((call) => call[0] === event) || []) as [string, Handler][];
    for (const call of calls) {
      const handler = call[1];
      handler(...args);
    }
  }),
  handle: vi.fn(),
  on: vi.fn(),
};

vi.mock('electron', () => ({
  ipcMain: mockIpcMain,
  default: {
    ipcMain: mockIpcMain,
  },
}));

const { mainZustandBridge, createDispatch } = await import('../src/main.js');

describe('createDispatch', () => {
  let mockStore: Record<string, Mock>;

  beforeEach(() => {
    mockStore = {
      getState: vi.fn(),
      setState: vi.fn(),
      subscribe: vi.fn(),
      getInitialState: vi.fn(),
    };
  });

  describe('when created with store-based handlers', () => {
    const testState: Record<string, Mock | string> = { test: 'state' };

    beforeEach(() => {
      testState.testAction = vi.fn();
      mockStore.getState.mockReturnValue(testState);
    });

    it('should call a handler with the expected payload - string action', () => {
      const dispatch = createDispatch(mockStore as unknown as StoreApi<AnyState>);

      dispatch('testAction', { test: 'payload' });

      expect(testState.testAction).toHaveBeenCalledWith({ test: 'payload' });
    });

    it('should call a handler with the expected payload - object action', () => {
      const dispatch = createDispatch(mockStore as unknown as StoreApi<AnyState>);

      dispatch({ type: 'testAction', payload: { test: 'payload' } });

      expect(testState.testAction).toHaveBeenCalledWith({ test: 'payload' });
    });
  });

  describe('when created with separate handlers', () => {
    let testHandlers: Record<string, Mock>;

    beforeEach(() => {
      testHandlers = { testAction: vi.fn() };
    });

    it('should call a handler with the expected payload - string action', () => {
      const dispatch = createDispatch(mockStore as unknown as StoreApi<AnyState>, { handlers: testHandlers });

      dispatch('testAction', { test: 'payload' });

      expect(testHandlers.testAction).toHaveBeenCalledWith({ test: 'payload' });
    });

    it('should call a handler with the expected payload - object action', () => {
      const dispatch = createDispatch(mockStore as unknown as StoreApi<AnyState>, { handlers: testHandlers });

      dispatch({ type: 'testAction', payload: { test: 'payload' } });

      expect(testHandlers.testAction).toHaveBeenCalledWith({ test: 'payload' });
    });
  });

  describe('when created with redux-style reducers', () => {
    it('should call the reducer and update the state', () => {
      const testState = { test: 'state' };
      const testReducer = vi.fn().mockImplementation((existingState, action) => {
        if (action.type === 'testAction' && action.payload === 'testPayload') {
          return {
            ...existingState,
            updated: 'state',
          };
        }
        return existingState;
      });

      const dispatch = createDispatch(mockStore as unknown as StoreApi<AnyState>, { reducer: testReducer });

      dispatch({ type: 'testAction', payload: 'testPayload' });

      expect(mockStore.setState).toHaveBeenCalledWith(expect.any(Function));

      const newTestState = mockStore.setState.mock.calls[0][0](testState);

      expect(newTestState).toStrictEqual({ test: 'state', updated: 'state' });
    });
  });
});

describe('mainZustandBridge', () => {
  let options: { handlers?: Record<string, Mock> };
  let mockStore: Record<string, Mock>;
  let mockWindows: Record<string, Mock | { send: Mock; isDestroyed: Mock }>[];

  beforeEach(() => {
    mockStore = {
      getState: vi.fn(),
      setState: vi.fn(),
      subscribe: vi.fn(),
    };
    mockWindows = [{ webContents: { send: vi.fn(), isDestroyed: vi.fn().mockReturnValue(false) } }];
    options = {};
  });

  afterEach(() => {
    mockIpcMain.on.mockClear();
    mockIpcMain.handle.mockClear();
    mockIpcMain.emit.mockClear();
    mockStore.getState.mockClear();
    mockStore.subscribe.mockClear();
  });

  it('should pass dispatch messages through to the store', () => {
    options.handlers = { test: vi.fn() };

    mainZustandBridge(
      mockStore as unknown as StoreApi<AnyState>,
      mockWindows as unknown as Electron.BrowserWindow[],
      options,
    );
    expect(mockIpcMain.on).toHaveBeenCalledWith('dispatch', expect.any(Function));
    mockIpcMain.emit('dispatch', {}, 'test', 'payload');

    expect(options.handlers.test).toHaveBeenCalledWith('payload');
  });

  it('should handle getState calls and return the sanitized state', async () => {
    mockStore.getState.mockImplementation(() => ({ test: 'state', testHandler: vi.fn() }));

    mainZustandBridge(
      mockStore as unknown as StoreApi<AnyState>,
      mockWindows as unknown as Electron.BrowserWindow[],
      options,
    );
    expect(mockIpcMain.handle).toHaveBeenCalledWith('getState', expect.any(Function));
    const getStateHandler = mockIpcMain.handle.mock.calls[0][1] as () => AnyState;

    const state = getStateHandler();

    expect(mockStore.getState).toHaveBeenCalled();
    expect(state).toStrictEqual({ test: 'state' });
  });

  it('should handle subscribe calls and send sanitized state to the window', async () => {
    const browserWindows = mockWindows as unknown as Electron.BrowserWindow[];

    mainZustandBridge(mockStore as unknown as StoreApi<AnyState>, browserWindows, options);
    expect(mockIpcMain.on).toHaveBeenCalledWith('subscribe', expect.any(Function));
    mockIpcMain.emit('subscribe', { test: 'state', testHandler: vi.fn() });

    expect(browserWindows[0].webContents.send).toHaveBeenCalledWith('subscribe', { test: 'state' });
  });

  it('should handle multiple windows', async () => {
    mockWindows = [
      { webContents: { send: vi.fn(), isDestroyed: vi.fn().mockReturnValue(false) } },
      { webContents: { send: vi.fn(), isDestroyed: vi.fn().mockReturnValue(false) } },
    ];
    const browserWindows = mockWindows as unknown as Electron.BrowserWindow[];

    mainZustandBridge(mockStore as unknown as StoreApi<AnyState>, browserWindows, options);
    expect(mockIpcMain.on).toHaveBeenCalledWith('subscribe', expect.any(Function));
    mockIpcMain.emit('subscribe', { test: 'state', testHandler: vi.fn() });

    expect(browserWindows[0].webContents.send).toHaveBeenCalledWith('subscribe', { test: 'state' });
    expect(browserWindows[1].webContents.send).toHaveBeenCalledWith('subscribe', { test: 'state' });
  });

  it('should handle destroyed windows', async () => {
    mockWindows = [
      { webContents: { send: vi.fn(), isDestroyed: vi.fn().mockReturnValue(false) } },
      { webContents: { send: vi.fn(), isDestroyed: vi.fn().mockReturnValue(true) } },
    ];
    const browserWindows = mockWindows as unknown as Electron.BrowserWindow[];

    mainZustandBridge(mockStore as unknown as StoreApi<AnyState>, browserWindows, options);
    expect(mockIpcMain.on).toHaveBeenCalledWith('subscribe', expect.any(Function));
    mockIpcMain.emit('subscribe', { test: 'state', testHandler: vi.fn() });

    expect(browserWindows[0].webContents.send).toHaveBeenCalledWith('subscribe', { test: 'state' });
    expect(browserWindows[1].webContents.send).not.toHaveBeenCalled();
  });

  it('should return an unsubscribe function', () => {
    const browserWindows = mockWindows as unknown as Electron.BrowserWindow[];
    mockStore.subscribe.mockImplementation(() => vi.fn());

    const bridge = mainZustandBridge(mockStore as unknown as StoreApi<AnyState>, browserWindows, options);

    expect(bridge.unsubscribe).toStrictEqual(expect.any(Function));
    expect(mockStore.subscribe).toHaveBeenCalledWith(expect.any(Function));
    const subscription = mockStore.subscribe.mock.calls[0][0];
    subscription('testState');
    expect(mockIpcMain.emit).toHaveBeenCalledWith('subscribe', 'testState');
  });

  it('should handle subscriptions for windows created at runtime', () => {
    const initialWindows = mockWindows as unknown as Electron.BrowserWindow[];
    mockStore.subscribe.mockImplementation(() => vi.fn());

    const bridge = mainZustandBridge(mockStore as unknown as StoreApi<AnyState>, initialWindows, options);

    expect(bridge.subscribe).toStrictEqual(expect.any(Function));

    const runtimeWindows = [{ webContents: { send: vi.fn(), isDestroyed: vi.fn().mockReturnValue(false) } }];
    bridge.subscribe(runtimeWindows as unknown as Electron.BrowserWindow[]);

    mockIpcMain.emit('subscribe', { test: 'state', testHandler: vi.fn() });

    expect(initialWindows[0].webContents.send).toHaveBeenCalledWith('subscribe', { test: 'state' });
    expect(runtimeWindows[0].webContents.send).toHaveBeenCalledWith('subscribe', { test: 'state' });
  });
});
