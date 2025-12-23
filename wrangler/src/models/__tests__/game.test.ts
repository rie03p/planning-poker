import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
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
      setAlarm: vi.fn(),
      deleteAlarm: vi.fn(),
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
        new Response('ok', {status: 200})),
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

  describe('vote validation', () => {
    it('should reject votes not in the current voting system', async () => {
      // Setup fibonacci voting system
      await mockState.storage.put('votingSystem', 'fibonacci');

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      // Use reflection to access private method for testing
      const handleMessage = (game as any).handleMessage.bind(game);

      // First join a participant
      await handleMessage('session-1', {
        type: 'join',
        name: 'Test User',
      });

      // Try to vote with a t-shirts value in fibonacci game
      await handleMessage('session-1', {
        type: 'vote',
        vote: 'XL', // This is valid for t-shirts but not fibonacci
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid vote "XL" for voting system "fibonacci"');

      consoleErrorSpy.mockRestore();
    });

    it('should accept valid votes for fibonacci system', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const handleMessage = (game as any).handleMessage.bind(game);

      // First join a participant
      await handleMessage('session-1', {
        type: 'join',
        name: 'Test User',
      });

      // Vote with valid fibonacci value
      await handleMessage('session-1', {
        type: 'vote',
        vote: '5',
      });

      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should reject votes not in t-shirts system', async () => {
      await mockState.storage.put('votingSystem', 't-shirts');

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const handleMessage = (game as any).handleMessage.bind(game);

      // First join a participant
      await handleMessage('session-1', {
        type: 'join',
        name: 'Test User',
      });

      // Try to vote with a fibonacci value in t-shirts game
      await handleMessage('session-1', {
        type: 'vote',
        vote: '13', // This is valid for fibonacci but not t-shirts
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid vote "13" for voting system "t-shirts"');

      consoleErrorSpy.mockRestore();
    });

    it('should accept valid votes for t-shirts system', async () => {
      await mockState.storage.put('votingSystem', 't-shirts');

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const handleMessage = (game as any).handleMessage.bind(game);

      // First join a participant
      await handleMessage('session-1', {
        type: 'join',
        name: 'Test User',
      });

      // Vote with valid t-shirts value
      await handleMessage('session-1', {
        type: 'vote',
        vote: 'M',
      });

      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should accept common values like ? and ☕ across all systems', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const handleMessage = (game as any).handleMessage.bind(game);

      // First join a participant
      await handleMessage('session-1', {
        type: 'join',
        name: 'Test User',
      });

      // Vote with ?
      await handleMessage('session-1', {
        type: 'vote',
        vote: '?',
      });

      // Vote with ☕
      await handleMessage('session-1', {
        type: 'vote',
        vote: '☕',
      });

      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
