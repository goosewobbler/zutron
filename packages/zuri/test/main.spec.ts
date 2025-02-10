import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { mainZustandBridge, createDispatch } from '../src/main';
import type { StoreApi } from 'zustand';
import type { AnyState } from '../src/index.js';

describe('createDispatch', () => {
  let store: Record<string, Mock>;

  beforeEach(() => {
    store = {
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
      store.getState.mockReturnValue(testState);
    });

    it('should call a handler with the expected payload - string action', () => {
      const dispatch = createDispatch(store as unknown as StoreApi<AnyState>);

      dispatch('testAction', { test: 'payload' });

      expect(testState.testAction).toHaveBeenCalledWith({ test: 'payload' });
    });

    it('should call a handler with the expected payload - object action', () => {
      const dispatch = createDispatch(store as unknown as StoreApi<AnyState>);

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
      const dispatch = createDispatch(store as unknown as StoreApi<AnyState>, { handlers: testHandlers });

      dispatch('testAction', { test: 'payload' });

      expect(testHandlers.testAction).toHaveBeenCalledWith({ test: 'payload' });
    });

    it('should call a handler with the expected payload - object action', () => {
      const dispatch = createDispatch(store as unknown as StoreApi<AnyState>, { handlers: testHandlers });

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

      const dispatch = createDispatch(store as unknown as StoreApi<AnyState>, { reducer: testReducer });

      dispatch({ type: 'testAction', payload: 'testPayload' });

      expect(store.setState).toHaveBeenCalledWith(expect.any(Function));

      const newTestState = store.setState.mock.calls[0][0](testState);

      expect(newTestState).toStrictEqual({ test: 'state', updated: 'state' });
    });
  });
});

describe('mainZustandBridge', () => {
  const options: { handlers?: Record<string, Mock> } = {};
  let mockIpcMain: Record<string, Mock>;
  let mockStore: Record<string, Mock>;
  let mockWindows: Record<string, Mock | { send: Mock }>[];

  beforeEach(() => {
    mockIpcMain = {
      on: vi.fn(),
      handle: vi.fn(),
      emit: vi.fn(),
    };
    mockStore = {
      getState: vi.fn(),
      setState: vi.fn(),
      subscribe: vi.fn(),
    };
    mockWindows = [{ isDestroyed: vi.fn().mockReturnValue(false), webContents: { send: vi.fn() } }];
  });

  it('should pass dispatch messages through to the store', () => {
    options.handlers = { test: vi.fn() };

    mainZustandBridge(
      mockIpcMain as unknown as Electron.CrossProcessExports.IpcMain,
      mockStore as unknown as StoreApi<AnyState>,
      mockWindows as unknown as Electron.BrowserWindow[],
      options,
    );
    expect(mockIpcMain.on).toHaveBeenCalledWith('dispatch', expect.any(Function));
    const dispatchHandler = mockIpcMain.on.mock.calls[1][1];

    dispatchHandler({}, 'test', 'payload');

    expect(options.handlers.test).toHaveBeenCalledWith('payload');
  });

  it('should handle getState calls and return the sanitized state', async () => {
    mockStore.getState.mockReturnValue({ test: 'state', testHandler: vi.fn() });

    mainZustandBridge(
      mockIpcMain as unknown as Electron.CrossProcessExports.IpcMain,
      mockStore as unknown as StoreApi<AnyState>,
      mockWindows as unknown as Electron.BrowserWindow[],
      options,
    );
    expect(mockIpcMain.handle).toHaveBeenCalledWith('getState', expect.any(Function));
    const getStateHandler = mockIpcMain.handle.mock.calls[0][1];

    const state = getStateHandler();

    expect(mockStore.getState).toHaveBeenCalled();
    expect(state).toStrictEqual({ test: 'state' });
  });

  it('should handle subscribe calls and send sanitized state to the window', async () => {
    const browserWindows = mockWindows as unknown as Electron.BrowserWindow[];

    mainZustandBridge(
      mockIpcMain as unknown as Electron.CrossProcessExports.IpcMain,
      mockStore as unknown as StoreApi<AnyState>,
      browserWindows,
      options,
    );
    expect(mockIpcMain.on).toHaveBeenCalledWith('subscribe', expect.any(Function));
    const subscribeHandler = mockIpcMain.on.mock.calls[0][1];

    await subscribeHandler({ test: 'state', testHandler: vi.fn() });

    expect(browserWindows[0].webContents.send).toHaveBeenCalledWith('subscribe', { test: 'state' });
  });

  it('should handle multiple windows', async () => {
    mockWindows = [
      { isDestroyed: vi.fn().mockReturnValue(false), webContents: { send: vi.fn() } },
      { isDestroyed: vi.fn().mockReturnValue(false), webContents: { send: vi.fn() } },
    ];
    const browserWindows = mockWindows as unknown as Electron.BrowserWindow[];

    mainZustandBridge(
      mockIpcMain as unknown as Electron.CrossProcessExports.IpcMain,
      mockStore as unknown as StoreApi<AnyState>,
      browserWindows,
      options,
    );
    expect(mockIpcMain.on).toHaveBeenCalledWith('subscribe', expect.any(Function));
    const subscribeHandler = mockIpcMain.on.mock.calls[0][1];

    await subscribeHandler({ test: 'state', testHandler: vi.fn() });

    expect(browserWindows[0].webContents.send).toHaveBeenCalledWith('subscribe', { test: 'state' });
    expect(browserWindows[1].webContents.send).toHaveBeenCalledWith('subscribe', { test: 'state' });
  });

  it('should handle destroyed windows', async () => {
    mockWindows = [
      { isDestroyed: vi.fn().mockReturnValue(false), webContents: { send: vi.fn() } },
      { isDestroyed: vi.fn().mockReturnValue(true), webContents: { send: vi.fn() } },
    ];
    const browserWindows = mockWindows as unknown as Electron.BrowserWindow[];

    mainZustandBridge(
      mockIpcMain as unknown as Electron.CrossProcessExports.IpcMain,
      mockStore as unknown as StoreApi<AnyState>,
      browserWindows,
      options,
    );
    expect(mockIpcMain.on).toHaveBeenCalledWith('subscribe', expect.any(Function));
    const subscribeHandler = mockIpcMain.on.mock.calls[0][1];

    await subscribeHandler({ test: 'state', testHandler: vi.fn() });

    expect(browserWindows[0].webContents.send).toHaveBeenCalledWith('subscribe', { test: 'state' });
    expect(browserWindows[1].webContents.send).not.toHaveBeenCalled();
  });

  it('should return an unsubscribe function', () => {
    const browserWindows = mockWindows as unknown as Electron.BrowserWindow[];
    mockStore.subscribe.mockImplementation(() => vi.fn());

    const bridge = mainZustandBridge(
      mockIpcMain as unknown as Electron.CrossProcessExports.IpcMain,
      mockStore as unknown as StoreApi<AnyState>,
      browserWindows,
      options,
    );

    expect(bridge.unsubscribe).toStrictEqual(expect.any(Function));
    expect(mockStore.subscribe).toHaveBeenCalledWith(expect.any(Function));
    const subscription = mockStore.subscribe.mock.calls[0][0];
    subscription('testState');
    expect(mockIpcMain.emit).toHaveBeenCalledWith('subscribe', 'testState');
  });
});
