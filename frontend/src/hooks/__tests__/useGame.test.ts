import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useGame} from '../useGame';

describe('useGame', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(
        JSON.stringify({exists: true}),
        {status: 200},
      );
    });
  });

  it('sends join message on websocket open', () => {
    const getWs = mockWebSocket();

    renderHook(() => useGame('test-game', 'Alice'));

    const ws = getWs();
    ws.emitOpen();

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({type: 'join', name: 'Alice'}),
    );
  });
});


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

    private listeners: Record<string, ((ev: Event | MessageEvent) => void)[]> = {};

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_url: string) {
      instance = {
        send: this.send,
        close: this.close,

        emitOpen: () => {
          this.listeners.open?.forEach((cb) =>
            cb(new Event('open')),
          );
        },

        emitMessage: (data: unknown) => {
          this.listeners.message?.forEach((cb) =>
            cb(new MessageEvent('message', {
              data: JSON.stringify(data),
            })),
          );
        },

        emitClose: () => {
          this.readyState = 3; // CLOSED
          this.listeners.close?.forEach((cb) =>
            cb(new CloseEvent('close')),
          );
        },

        emitError: (error?: unknown) => {
          this.listeners.error?.forEach((cb) =>
            cb(new ErrorEvent('error', {error})),
          );
        },
      };
    }

    addEventListener(type: string, cb: (ev: Event | MessageEvent) => void) {
      this.listeners[type] ??= [];
      this.listeners[type].push(cb);
    }

    removeEventListener(type: string, cb: (ev: Event | MessageEvent) => void) {
      this.listeners[type] = (this.listeners[type] ?? []).filter(
        (listener) => listener !== cb,
      );
    }
  }

  globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;

  return () => instance;
}
