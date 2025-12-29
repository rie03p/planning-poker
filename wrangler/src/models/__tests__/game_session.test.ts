
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
    const {sessionToUserId, sessions} = (game as any);

    const sessionA = 'session-A';
    const sessionB = 'session-B';

    // Setup mock websockets for sessions
    const mockWsA = {send: vi.fn(), close: vi.fn()};
    const mockWsB = {send: vi.fn(), close: vi.fn()};
    sessions.set(sessionA, mockWsA);
    sessions.set(sessionB, mockWsB);

    // 1. Join user 1 (session A) - server will assign a userId
    await handleMessage(sessionA, {
      type: 'join',
      name: 'User 1',
      clientId: 'user-123',
    });

    // Extract userId from joined message
    const joinedCallA = mockWsA.send.mock.calls.find((call: any) => {
      try {
        const message = JSON.parse(call[0]);
        return message.type === 'joined';
      } catch {
        return false;
      }
    });
    if (!joinedCallA) {
      throw new Error('No joined message found for session A');
    }

    const userIdA = JSON.parse(joinedCallA[0]).userId;

    expect(gameState.participants.size).toBe(1);
    expect(gameState.participants.get(userIdA)).toBeDefined();
    expect(sessionToUserId.get(sessionA)).toBe(userIdA);

    // 2. Join user 1 again (session B) with the same client-provided ID.
    // The server will generate a new unique userId because the provided clientId ('user-123') does not match an existing participant's ID.
    await handleMessage(sessionB, {
      type: 'join',
      name: 'User 1',
      clientId: 'user-123',
    });

    // Extract userId from second joined message
    const joinedCallB = mockWsB.send.mock.calls.find((call: any) => {
      try {
        const message = JSON.parse(call[0]);
        return message.type === 'joined';
      } catch {
        return false;
      }
    });
    if (!joinedCallB) {
      throw new Error('No joined message found for session B');
    }

    const userIdB = JSON.parse(joinedCallB[0]).userId;

    // Different userIds because clientId is already in use by sessionA
    expect(userIdA).not.toBe(userIdB);
    expect(gameState.participants.size).toBe(2);
    expect(sessionToUserId.size).toBe(2);

    // 3. Vote from session A
    await handleMessage(sessionA, {
      type: 'vote',
      vote: '5',
    });

    expect(gameState.participants.get(userIdA).vote).toBe('5');

    // 4. Disconnect session A
    await handleDisconnect(sessionA);

    // userIdA should be removed, but userIdB should still exist
    expect(gameState.participants.has(userIdA)).toBe(false);
    expect(gameState.participants.has(userIdB)).toBe(true);
    expect(gameState.participants.size).toBe(1);

    // 5. Now reconnect with session C using same clientId 'user-123'
    // Since sessionA disconnected, the clientId should be available again
    const sessionC = 'session-C';
    const mockWsC = {send: vi.fn(), close: vi.fn()};
    sessions.set(sessionC, mockWsC);

    await handleMessage(sessionC, {
      type: 'join',
      name: 'User 1',
      clientId: 'user-123',
    });

    const joinedCallC = mockWsC.send.mock.calls.find((call: any) => {
      try {
        const message = JSON.parse(call[0]);
        return message.type === 'joined';
      } catch {
        return false;
      }
    });
    if (!joinedCallC) {
      throw new Error('No joined message found for session C');
    }

    const userIdC = JSON.parse(joinedCallC[0]).userId;

    // With new security: clientId 'user-123' is NOT in participants anymore (sessionA disconnected)
    // So server will generate a NEW UUID instead of accepting the arbitrary clientId
    expect(userIdC).not.toBe('user-123');
    expect(userIdC).toMatch(/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/);
    expect(gameState.participants.size).toBe(2);
  });

  it('should allow reconnection with same userId if still in participants', async () => {
    await mockState.storage.put('votingSystem', 'fibonacci');

    const handleMessage = (game as any).handleMessage.bind(game);
    const {gameState, sessions} = (game as any);

    const sessionA = 'session-A';
    const mockWsA = {send: vi.fn(), close: vi.fn()};
    sessions.set(sessionA, mockWsA);

    // First join
    await handleMessage(sessionA, {
      type: 'join',
      name: 'User 1',
      clientId: 'any-id',
    });

    const joinedCallA = mockWsA.send.mock.calls.find((call: any) => {
      try {
        const message = JSON.parse(call[0]);
        return message.type === 'joined';
      } catch {
        return false;
      }
    });
    if (!joinedCallA) {
      throw new Error('No joined message found for session A');
    }

    const userIdA = JSON.parse(joinedCallA[0]).userId;

    expect(gameState.participants.has(userIdA)).toBe(true);

    // Second session with same userId (e.g., opening in another tab)
    const sessionB = 'session-B';
    const mockWsB = {send: vi.fn(), close: vi.fn()};
    sessions.set(sessionB, mockWsB);

    await handleMessage(sessionB, {
      type: 'join',
      name: 'User 1',
      clientId: userIdA, // Use the server-assigned ID
    });

    const joinedCallB = mockWsB.send.mock.calls.find((call: any) => {
      try {
        const message = JSON.parse(call[0]);
        return message.type === 'joined';
      } catch {
        return false;
      }
    });
    if (!joinedCallB) {
      throw new Error('No joined message found for session B');
    }

    const userIdB = JSON.parse(joinedCallB[0]).userId;

    // Should get the SAME userId because it's in participants
    expect(userIdB).toBe(userIdA);
    expect(gameState.participants.size).toBe(1); // Still just one participant
  });
});
