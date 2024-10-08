import { vi } from 'vitest';

export function createIpcRendererMock() {
  return {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    send: vi.fn(),
    invoke: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    off: vi.fn(),
    postMessage: vi.fn(),
    removeAllListeners: vi.fn(),
    sendSync: vi.fn(),
    sendToHost: vi.fn(),
    setMaxListeners: vi.fn(),
    getMaxListeners: vi.fn(),
    emit: vi.fn(),
    prependListener: vi.fn(),
    listenerCount: vi.fn(),
    listeners: vi.fn(),
    prependOnceListener: vi.fn(),
    rawListeners: vi.fn(),
    eventNames: vi.fn(),
  };
}
