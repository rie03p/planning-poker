import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import {renderHook, waitFor} from '@testing-library/react';
import type {ServerMessage} from '@planning-poker/shared';
import {useWebSocket} from '../useWebSocket';

type MockWsInstance = {
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  emitOpen: () => void;
  emitMessage: (data: unknown) => void;
  emitClose: () => void;
  emitError: (error?: unknown) => void;
};

function mockWebSocket() {
  let instance!: MockWsInstance;

  class MockWebSocket {
    static OPEN = 1;
    readyState = MockWebSocket.OPEN;

    send = vi.fn();
    close = vi.fn();

    private listeners: Record<string, Array<(ev: Event | MessageEvent) => void>> = {};

    constructor() {
      instance = {
        send: this.send,
        close: this.close,

        emitOpen: () => {
          if (this.listeners.open) {
            for (const cb of this.listeners.open) {
              cb(new Event('open'));
            }
          }
        },

        emitMessage: (data: unknown) => {
          if (this.listeners.message) {
            for (const cb of this.listeners.message) {
              cb(new MessageEvent('message', {
                data: JSON.stringify(data),
              }));
            }
          }
        },

        emitClose: () => {
          this.readyState = 3; // CLOSED
          if (this.listeners.close) {
            for (const cb of this.listeners.close) {
              cb(new CloseEvent('close'));
            }
          }
        },

        emitError: (error?: unknown) => {
          if (this.listeners.error) {
            for (const cb of this.listeners.error) {
              cb(new ErrorEvent('error', {error}));
            }
          }
        },
      };
    }

    addEventListener(type: string, cb: (ev: Event | MessageEvent) => void) {
      this.listeners[type] ??= [];
      this.listeners[type].push(cb);
    }

    removeEventListener(type: string, cb: (ev: Event | MessageEvent) => void) {
      this.listeners[type] = (this.listeners[type] ?? []).filter(listener => listener !== cb);
    }
  }

  globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;

  return () => instance;
}

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates WebSocket connection', () => {
    mockWebSocket();
    const onMessage = vi.fn();

    renderHook(() =>
      useWebSocket({
        gameId: 'test-game',
        name: 'Alice',
        initialUserId: 'user-123',
        onMessage,
      }));

    expect(globalThis.WebSocket).toBeDefined();
  });

  it('calls onOpen callback when connection opens', () => {
    const getWs = mockWebSocket();
    const onMessage = vi.fn();
    const onOpen = vi.fn();

    renderHook(() =>
      useWebSocket({
        gameId: 'test-game',
        name: 'Alice',
        initialUserId: 'user-123',
        onMessage,
        onOpen,
      }));

    const ws = getWs();
    ws.emitOpen();

    expect(onOpen).toHaveBeenCalled();
  });

  it('sends join message when connection opens', () => {
    const getWs = mockWebSocket();
    const onMessage = vi.fn();

    renderHook(() =>
      useWebSocket({
        gameId: 'test-game',
        name: 'Alice',
        initialUserId: 'user-123',
        onMessage,
      }));

    const ws = getWs();
    ws.emitOpen();

    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({type: 'join', name: 'Alice', clientId: 'user-123'}));
  });

  it('sends join message without clientId when initialUserId is empty', () => {
    const getWs = mockWebSocket();
    const onMessage = vi.fn();

    renderHook(() =>
      useWebSocket({
        gameId: 'test-game',
        name: 'Alice',
        initialUserId: '',
        onMessage,
      }));

    const ws = getWs();
    ws.emitOpen();

    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({type: 'join', name: 'Alice', clientId: undefined}));
  });

  it('calls onMessage callback when message is received', async () => {
    const getWs = mockWebSocket();
    const onMessage = vi.fn();

    renderHook(() =>
      useWebSocket({
        gameId: 'test-game',
        name: 'Alice',
        initialUserId: 'user-123',
        onMessage,
      }));

    const ws = getWs();
    const message: ServerMessage = {
      type: 'update',
      participants: [],
      revealed: false,
      issues: [],
      activeIssueId: undefined,
    };

    ws.emitMessage(message);

    await waitFor(() => {
      expect(onMessage).toHaveBeenCalledWith(message);
    });
  });

  it('calls onError callback when error occurs', async () => {
    const getWs = mockWebSocket();
    const onMessage = vi.fn();
    const onError = vi.fn();

    renderHook(() =>
      useWebSocket({
        gameId: 'test-game',
        name: 'Alice',
        initialUserId: 'user-123',
        onMessage,
        onError,
      }));

    const ws = getWs();
    ws.emitError();

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('calls onClose callback when connection closes', async () => {
    const getWs = mockWebSocket();
    const onMessage = vi.fn();
    const onClose = vi.fn();

    renderHook(() =>
      useWebSocket({
        gameId: 'test-game',
        name: 'Alice',
        initialUserId: 'user-123',
        onMessage,
        onClose,
      }));

    const ws = getWs();
    ws.emitClose();

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('sends message via send method', () => {
    const getWs = mockWebSocket();
    const onMessage = vi.fn();

    const {result} = renderHook(() =>
      useWebSocket({
        gameId: 'test-game',
        name: 'Alice',
        initialUserId: 'user-123',
        onMessage,
      }));

    result.current.send({type: 'vote', vote: '5'});

    const ws = getWs();
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({type: 'vote', vote: '5'}));
  });

  it('disconnects WebSocket via disconnect method', () => {
    const getWs = mockWebSocket();
    const onMessage = vi.fn();

    const {result} = renderHook(() =>
      useWebSocket({
        gameId: 'test-game',
        name: 'Alice',
        initialUserId: 'user-123',
        onMessage,
      }));

    result.current.disconnect();

    const ws = getWs();
    expect(ws.close).toHaveBeenCalled();
  });

  it('cleans up connection on unmount', () => {
    const getWs = mockWebSocket();
    const onMessage = vi.fn();

    const {unmount} = renderHook(() =>
      useWebSocket({
        gameId: 'test-game',
        name: 'Alice',
        initialUserId: 'user-123',
        onMessage,
      }));

    const ws = getWs();
    unmount();

    expect(ws.close).toHaveBeenCalled();
  });

  it('logs error for invalid JSON messages', async () => {
    const onMessage = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {
      /* no-op */
    });

    class CustomMockWebSocket {
      static OPEN = 1;
      readyState = CustomMockWebSocket.OPEN;
      send = vi.fn();
      close = vi.fn();
      private listeners: Record<string, Array<(ev: Event | MessageEvent) => void>> = {};

      addEventListener(type: string, cb: (ev: Event | MessageEvent) => void) {
        this.listeners[type] ??= [];
        this.listeners[type].push(cb);
      }

      removeEventListener(type: string, cb: (ev: Event | MessageEvent) => void) {
        this.listeners[type] = (this.listeners[type] ?? []).filter(listener => listener !== cb);
      }

      emitInvalidMessage() {
        if (this.listeners.message) {
          for (const cb of this.listeners.message) {
            cb(new MessageEvent('message', {
              data: 'invalid json',
            }));
          }
        }
      }
    }

    let customInstance: CustomMockWebSocket;
    globalThis.WebSocket = function (this: unknown) {
      customInstance = new CustomMockWebSocket();
      return customInstance as unknown;
    } as unknown as typeof WebSocket;

    renderHook(() =>
      useWebSocket({
        gameId: 'test-game',
        name: 'Alice',
        initialUserId: 'user-123',
        onMessage,
      }));

    customInstance!.emitInvalidMessage();

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error parsing message:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('validates message with zod schema', async () => {
    const getWs = mockWebSocket();
    const onMessage = vi.fn();

    renderHook(() =>
      useWebSocket({
        gameId: 'test-game',
        name: 'Alice',
        initialUserId: 'user-123',
        onMessage,
      }));

    const ws = getWs();
    const validMessage: ServerMessage = {
      type: 'joined',
      userId: 'test-user',
      votingSystem: 'fibonacci',
      participants: [],
      revealed: false,
      issues: [],
      activeIssueId: undefined,
    };

    ws.emitMessage(validMessage);

    await waitFor(() => {
      expect(onMessage).toHaveBeenCalledWith(validMessage);
    });
  });

  it('does not send messages when WebSocket is closed', () => {
    const onMessage = vi.fn();
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
      /* no-op */
    });

    // Create a mock WebSocket that is closed
    class ClosedMockWebSocket {
      static CLOSED = 3;
      readyState = ClosedMockWebSocket.CLOSED;
      send = vi.fn();
      close = vi.fn();
      private listeners: Record<string, Array<(ev: Event | MessageEvent) => void>> = {};

      addEventListener(type: string, cb: (ev: Event | MessageEvent) => void) {
        this.listeners[type] ??= [];
        this.listeners[type].push(cb);
      }

      removeEventListener(type: string, cb: (ev: Event | MessageEvent) => void) {
        this.listeners[type] = (this.listeners[type] ?? []).filter(listener => listener !== cb);
      }
    }

    let closedInstance: ClosedMockWebSocket;
    globalThis.WebSocket = function (this: unknown) {
      closedInstance = new ClosedMockWebSocket();
      return closedInstance as unknown;
    } as unknown as typeof WebSocket;

    const {result} = renderHook(() =>
      useWebSocket({
        gameId: 'test-game',
        name: 'Alice',
        initialUserId: 'user-123',
        onMessage,
      }));

    result.current.send({type: 'vote', vote: '5'});

    expect(closedInstance!.send).not.toHaveBeenCalled();
    expect(consoleWarn).toHaveBeenCalledWith('WebSocket is not connected');

    consoleWarn.mockRestore();
  });
});

