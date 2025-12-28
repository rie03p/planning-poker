
import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
import {Game} from '../game';

// Mock DurableObjectState - simplified from game.test.ts
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

describe('Game Session Management', () => {
  let game: Game;
  let mockState: any;
  let mockEnv: any;

  beforeEach(() => {
    mockState = createMockState();
    mockEnv = createMockEnv();
    game = new Game(mockState, mockEnv);
  });

  it('should handle multiple sessions for the same user', async () => {
    await mockState.storage.put('votingSystem', 'fibonacci');

    // Access private members via any
    const handleMessage = (game as any).handleMessage.bind(game);
    const handleDisconnect = (game as any).handleDisconnect.bind(game);
    const {gameState} = (game as any);
    const {sessionToUserId} = (game as any);

    const userId = 'user-123';
    const sessionA = 'session-A';
    const sessionB = 'session-B';

    // 1. Join user 1 (session A)
    await handleMessage(sessionA, {
      type: 'join',
      name: 'User 1',
      id: userId,
    });

    expect(gameState.participants.size).toBe(1);
    expect(gameState.participants.get(userId)).toBeDefined();
    expect(sessionToUserId.get(sessionA)).toBe(userId);

    // 2. Join user 1 again (session B)
    await handleMessage(sessionB, {
      type: 'join',
      name: 'User 1',
      id: userId,
    });

    // Should still be 1 participant
    expect(gameState.participants.size).toBe(1);
    expect(gameState.participants.get(userId)).toBeDefined();
    expect(sessionToUserId.get(sessionB)).toBe(userId);
    expect(sessionToUserId.size).toBe(2);

    // 3. Vote from session A
    await handleMessage(sessionA, {
      type: 'vote',
      vote: '5',
    });

    expect(gameState.participants.get(userId).vote).toBe('5');

    // 4. Disconnect session A
    await handleDisconnect(sessionA);

    // User should still exist because session B is active
    expect(gameState.participants.size).toBe(1);
    expect(sessionToUserId.has(sessionA)).toBe(false);
    expect(sessionToUserId.has(sessionB)).toBe(true);

    // 5. Disconnect session B
    await handleDisconnect(sessionB);

    // User should be removed now
    expect(gameState.participants.size).toBe(0);
    expect(sessionToUserId.size).toBe(0);
  });
});
