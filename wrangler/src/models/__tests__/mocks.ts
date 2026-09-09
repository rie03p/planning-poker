import {vi} from 'vitest';

// Mock DurableObjectState
export const createMockState = () => {
  const storage = new Map<string, any>();
  return {
    id: {name: 'test-game', toString: () => 'test-game'},
    storage: {
      get: vi.fn(async (key: string) => storage.get(key)),
      put: vi.fn(async (key: string, value: any) => {
        storage.set(key, value);
      }),
      delete: vi.fn(async (key: string) => {
        storage.delete(key);
      }),
      deleteAll: vi.fn(async () => {
        storage.clear();
      }),
      setAlarm: vi.fn(),
      deleteAlarm: vi.fn(),
    },
    waitUntil: vi.fn(),
    blockConcurrencyWhile: vi.fn(),
  } as any;
};

// Mock Env
export const createMockEnv = () =>
  ({
    GAME: {
      idFromName: vi.fn((name: string) => ({name})),
      get: vi.fn(),
    },
    REGISTRY: {
      idFromName: vi.fn((name: string) => ({name})),
      get: vi.fn(() => ({
        fetch: vi.fn(async () => new Response('ok', {status: 200})),
      })),
    },
  }) as any;
