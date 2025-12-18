import {describe, it, expect, vi, beforeEach} from 'vitest';
import {Game} from '../game';

// Mock DurableObjectState
const createMockState = () => {
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
      setAlarm: vi.fn(async () => {}),
      deleteAlarm: vi.fn(async () => {}),
    },
    waitUntil: vi.fn(),
    blockConcurrencyWhile: vi.fn(),
  } as any;
};

// Mock Env
const createMockEnv = () => ({
  GAME: {
    idFromName: vi.fn((name: string) => ({name})),
    get: vi.fn(),
  },
  REGISTRY: {
    idFromName: vi.fn((name: string) => ({name})),
    get: vi.fn(() => ({
      fetch: vi.fn(async () =>
        new Response('ok', {status: 200}),
      ),
    })),
  },
} as any);

describe('Game', () => {
  let game: Game;
  let mockState: any;
  let mockEnv: any;

  beforeEach(() => {
    mockState = createMockState();
    mockEnv = createMockEnv();
    game = new Game(mockState, mockEnv);
  });

  describe('fetch', () => {
    it('should reject non-WebSocket requests', async () => {
      const request = new Request('http://localhost/game/test-game', {
        headers: {},
      });

      const response = await game.fetch(request);

      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Expected WebSocket');
    });
  });

  describe('alarm', () => {
    it('should cleanup when no participants', async () => {
      await mockState.storage.put('gameId', 'test-game');

      await game.alarm();

      expect(mockState.storage.deleteAll).toHaveBeenCalled();
    });
  });
});
