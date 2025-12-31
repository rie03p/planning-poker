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

  const joinAndGetUserId = async (sessionId: string, name: string, clientId?: string): Promise<string> => {
    const {sessions} = (game as any);
    const mockWs = {
      send: vi.fn(),
      close: vi.fn(),
    };
    sessions.set(sessionId, mockWs);

    const handleMessage = (game as any).handleMessage.bind(game);
    await handleMessage(sessionId, {
      type: 'join',
      name,
      clientId,
    });

    // Extract userId from the 'joined' message
    const joinedCall = mockWs.send.mock.calls.find((call: any) => {
      try {
        const message = JSON.parse(call[0]);
        return message.type === 'joined';
      } catch {
        return false;
      }
    });

    if (!joinedCall) {
      throw new Error('No joined message found');
    }

    const joinedMessage = JSON.parse(joinedCall[0]);
    return joinedMessage.userId;
  };

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
        clientId: 'user-1',
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
        clientId: 'user-1',
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
        clientId: 'user-1',
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
        clientId: 'user-1',
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
        clientId: 'user-1',
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

  describe('userId security', () => {
    it('should ignore arbitrary clientId and generate new userId for fresh join', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');

      const userId = await joinAndGetUserId('session-1', 'Test User', 'fake-client-id-123');

      // The userId returned should be a server-generated UUID, not the fake clientId
      expect(userId).not.toBe('fake-client-id-123');
      expect(userId).toMatch(/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/);
    });

    it('should generate new userId on reconnection if participant was removed', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');
      const {gameState} = (game as any);

      // First join - get server-assigned ID
      const userId = await joinAndGetUserId('session-1', 'Test User', 'any-id');
      (game as any).sessionToUserId.set('session-1', userId);

      expect(gameState.participants.has(userId)).toBe(true);

      // Disconnect
      const handleDisconnect = (game as any).handleDisconnect.bind(game);
      await handleDisconnect('session-1');

      // Participant should be removed after disconnect
      expect(gameState.participants.has(userId)).toBe(false);

      // Try to reconnect with the same userId
      const reconnectedUserId = await joinAndGetUserId('session-2', 'Test User', userId);

      // Should get a NEW userId because the old one is no longer in participants
      expect(reconnectedUserId).not.toBe(userId);
      expect(reconnectedUserId).toMatch(/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/);
    });
  });

  describe('participant limit', () => {
    it('should reject join when room is full (14 participants)', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');

      const handleMessage = (game as any).handleMessage.bind(game);
      const {sessions} = (game as any);
      const {gameState} = (game as any);

      // Add 14 participants to game state and sessions (with individual mocks)
      for (let i = 0; i < 14; i++) {
        const sessionId = `session-${i}`;
        const mockWs = {
          send: vi.fn(),
          close: vi.fn(),
        };
        sessions.set(sessionId, mockWs);
        gameState.participants.set(sessionId, {
          id: sessionId,
          name: `User ${i}`,
          vote: undefined,
        });
        // Mock session mapping
        (game as any).sessionToUserId.set(sessionId, sessionId);
      }

      // Create mock for 15th participant
      const ws15 = {
        send: vi.fn(),
        close: vi.fn(),
      };
      sessions.set('session-15', ws15);

      // Try to join the 15th participant
      await handleMessage('session-15', {
        type: 'join',
        name: 'User 15',
        clientId: 'user-15',
      });

      // Should send room-full message and close connection
      expect(ws15.send).toHaveBeenCalledWith(JSON.stringify({type: 'room-full'}));
      expect(ws15.close).toHaveBeenCalledWith(1000, 'Room is full');

      // Participant should not be added
      expect(gameState.participants.size).toBe(14);
    });

    it('should allow join when under limit', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');

      const {gameState} = (game as any);

      // Add 13 participants using joinAndGetUserId
      const joinPromises = Array.from({length: 13}, async (_, i) => {
        const sessionId = `session-${i}`;
        const userId = await joinAndGetUserId(sessionId, `User ${i}`, `user-${i}`);
        (game as any).sessionToUserId.set(sessionId, userId);
      });
      await Promise.all(joinPromises);

      // Try to join the 14th participant (should succeed)
      const userId14 = await joinAndGetUserId('session-14', 'User 14', 'user-14');
      const ws14 = (game as any).sessions.get('session-14');

      // Should NOT send room-full message
      const roomFullCall = ws14.send.mock.calls.find((call: any) => {
        try {
          const message = JSON.parse(call[0]);
          return message.type === 'room-full';
        } catch {
          return false;
        }
      });
      expect(roomFullCall).toBeUndefined();
      expect(ws14.close).not.toHaveBeenCalled();

      // Participant should be added
      expect(gameState.participants.has(userId14)).toBe(true);
      expect(gameState.participants.size).toBe(14);
    });
  });

  describe('update issue', () => {
    it('should update issue details and broadcast update', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');
      const handleMessage = (game as any).handleMessage.bind(game);
      const {gameState} = (game as any);

      // Join participant
      await handleMessage('session-1', {
        type: 'join',
        name: 'Test User',
        clientId: 'user-1',
      });

      // Add issue
      await handleMessage('session-1', {
        type: 'add-issue',
        issue: {title: 'Old Title'},
      });

      const issueId = gameState.issues[0].id;

      // Mock broadcast to verify update
      const broadcastSpy = vi.spyOn(game as any, 'broadcast');

      // Update issue
      await handleMessage('session-1', {
        type: 'update-issue',
        issue: {
          id: issueId,
          title: 'New Title',
          description: 'New Description',
        },
      });

      expect(gameState.issues[0].title).toBe('New Title');
      expect(gameState.issues[0].description).toBe('New Description');
      expect(broadcastSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'issue-updated',
        issue: expect.objectContaining({
          id: issueId,
          title: 'New Title',
          description: 'New Description',
        }),
      }));
    });
  });

  describe('handleDisconnect', () => {
    it('should remove participant and broadcast update', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');
      const handleDisconnect = (game as any).handleDisconnect.bind(game);
      const {gameState} = (game as any);

      // Join participant and get assigned userId
      const userId = await joinAndGetUserId('session-1', 'Test User', 'user-1');
      (game as any).sessionToUserId.set('session-1', userId);

      expect(gameState.participants.has(userId)).toBe(true);

      const broadcastSpy = vi.spyOn(game as any, 'broadcast');

      // Act: Disconnect
      await handleDisconnect('session-1');

      // Assert
      expect(gameState.participants.has(userId)).toBe(false);
      expect(broadcastSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'update',
        participants: [],
      }));
    });

    it('should set alarm if room becomes empty', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');
      const handleMessage = (game as any).handleMessage.bind(game);
      const handleDisconnect = (game as any).handleDisconnect.bind(game);

      // Join participant
      await handleMessage('session-1', {
        type: 'join',
        name: 'Test User',
        clientId: 'user-1',
      });

      // Act: Disconnect
      await handleDisconnect('session-1');

      // Assert
      expect(mockState.storage.setAlarm).toHaveBeenCalled();
    });
  });

  describe('reveal', () => {
    it('should set revealed to true and broadcast', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');
      const handleMessage = (game as any).handleMessage.bind(game);
      const {gameState} = (game as any);

      // Join participant
      await handleMessage('session-1', {
        type: 'join',
        name: 'Test User',
        clientId: 'user-1',
      });

      const broadcastSpy = vi.spyOn(game as any, 'broadcast');

      // Act: Reveal
      await handleMessage('session-1', {
        type: 'reveal',
      });

      // Assert
      expect(gameState.revealed).toBe(true);
      expect(broadcastSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'update',
        revealed: true,
      }));
    });

    it('should save vote results to active issue when revealed', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');
      const handleMessage = (game as any).handleMessage.bind(game);
      const {gameState} = (game as any);

      // Join participants
      const user1Id = await joinAndGetUserId('session-1', 'User 1', 'user-1');
      const user2Id = await joinAndGetUserId('session-2', 'User 2', 'user-2');
      const user3Id = await joinAndGetUserId('session-3', 'User 3', 'user-3');
      (game as any).sessionToUserId.set('session-1', user1Id);
      (game as any).sessionToUserId.set('session-2', user2Id);
      (game as any).sessionToUserId.set('session-3', user3Id);

      // Add an issue
      await handleMessage('session-1', {
        type: 'add-issue',
        issue: {title: 'Test Issue', description: 'Test Description'},
      });

      const issueId = gameState.issues[0].id;
      expect(gameState.activeIssueId).toBe(issueId);

      // Vote
      await handleMessage('session-1', {type: 'vote', vote: '5'});
      await handleMessage('session-2', {type: 'vote', vote: '8'});
      await handleMessage('session-3', {type: 'vote', vote: '5'});

      const broadcastSpy = vi.spyOn(game as any, 'broadcast');

      // Act: Reveal
      await handleMessage('session-1', {type: 'reveal'});

      // Assert
      expect(gameState.revealed).toBe(true);
      expect(gameState.issues[0].voteResults).toEqual({
        5: 2,
        8: 1,
      });
      expect(broadcastSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'issue-updated',
        issue: expect.objectContaining({
          id: issueId,
          title: 'Test Issue',
          voteResults: {5: 2, 8: 1},
        }),
      }));
    });

    it('should handle reveal without active issue', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');
      const handleMessage = (game as any).handleMessage.bind(game);
      const {gameState} = (game as any);

      // Join participants
      const user1Id = await joinAndGetUserId('session-1', 'User 1', 'user-1');
      (game as any).sessionToUserId.set('session-1', user1Id);

      // Vote without active issue
      await handleMessage('session-1', {type: 'vote', vote: '5'});

      const broadcastSpy = vi.spyOn(game as any, 'broadcast');

      // Act: Reveal
      await handleMessage('session-1', {type: 'reveal'});

      // Assert
      expect(gameState.revealed).toBe(true);
      expect(gameState.issues).toHaveLength(0);
      // Should not throw error or crash
      expect(broadcastSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'update',
        revealed: true,
      }));
    });

    it('should handle reveal with no votes', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');
      const handleMessage = (game as any).handleMessage.bind(game);
      const {gameState} = (game as any);

      // Join participants
      await joinAndGetUserId('session-1', 'User 1', 'user-1');

      // Add an issue
      await handleMessage('session-1', {
        type: 'add-issue',
        issue: {title: 'Test Issue'},
      });

      const issueId = gameState.issues[0].id;
      const broadcastSpy = vi.spyOn(game as any, 'broadcast');

      // Act: Reveal without any votes
      await handleMessage('session-1', {type: 'reveal'});

      // Assert
      expect(gameState.revealed).toBe(true);
      expect(gameState.issues[0].voteResults).toEqual({});
      expect(broadcastSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'issue-updated',
        issue: expect.objectContaining({
          id: issueId,
          voteResults: {},
        }),
      }));
    });
  });

  describe('reset', () => {
    it('should reset state and broadcast', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');
      const handleMessage = (game as any).handleMessage.bind(game);
      const {gameState} = (game as any);

      // Join and vote - get userId from server
      const userId = await joinAndGetUserId('session-1', 'Test User', 'user-1');
      (game as any).sessionToUserId.set('session-1', userId);

      await handleMessage('session-1', {
        type: 'vote',
        vote: '5',
      });

      gameState.revealed = true;
      gameState.activeIssueId = 'some-issue-id';

      const broadcastSpy = vi.spyOn(game as any, 'broadcast');

      // Act: Reset
      await handleMessage('session-1', {
        type: 'reset',
      });

      // Assert
      expect(gameState.revealed).toBe(false);
      expect(gameState.activeIssueId).toBeUndefined();
      expect(gameState.participants.get(userId).vote).toBeUndefined();
      expect(broadcastSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'reset',
        activeIssueId: undefined,
        issues: expect.any(Array),
        participants: expect.any(Array),
      }));
    });
  });

  describe('issue management', () => {
    it('should add issue and set as active if first', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');
      const handleMessage = (game as any).handleMessage.bind(game);
      const {gameState} = (game as any);

      // Join
      await handleMessage('session-1', {type: 'join', name: 'User', clientId: 'user-1'});

      const broadcastSpy = vi.spyOn(game as any, 'broadcast');

      // Act: Add Issue
      await handleMessage('session-1', {
        type: 'add-issue',
        issue: {title: 'Issue 1'},
      });

      // Assert
      expect(gameState.issues).toHaveLength(1);
      expect(gameState.issues[0].title).toBe('Issue 1');
      expect(gameState.activeIssueId).toBe(gameState.issues[0].id);
      expect(broadcastSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'issue-added',
        issue: expect.objectContaining({
          id: gameState.issues[0].id,
          title: 'Issue 1',
        }),
      }));
      expect(broadcastSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'update',
        activeIssueId: gameState.issues[0].id,
      }));
    });

    it('should remove issue and unset active if it matches', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');
      const handleMessage = (game as any).handleMessage.bind(game);
      const {gameState} = (game as any);

      // Join
      await handleMessage('session-1', {type: 'join', name: 'User', clientId: 'user-1'});

      // Add Issue
      await handleMessage('session-1', {
        type: 'add-issue',
        issue: {title: 'Issue 1'},
      });
      const issueId = gameState.issues[0].id;

      // Act: Remove Issue
      await handleMessage('session-1', {
        type: 'remove-issue',
        issueId,
      });

      // Assert
      expect(gameState.issues).toHaveLength(0);
      expect(gameState.activeIssueId).toBeUndefined();
    });

    it('should set active issue and reset votes/revealed', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');
      const handleMessage = (game as any).handleMessage.bind(game);
      const {gameState} = (game as any);

      // Join and Vote - get userId from server
      const userId = await joinAndGetUserId('session-1', 'User', 'user-1');
      (game as any).sessionToUserId.set('session-1', userId);

      await handleMessage('session-1', {type: 'vote', vote: '5'});
      gameState.revealed = true;

      // Add issues
      await handleMessage('session-1', {type: 'add-issue', issue: {title: 'Issue 1'}});
      await handleMessage('session-1', {type: 'add-issue', issue: {title: 'Issue 2'}});

      const issue2Id = gameState.issues[1].id;

      // Act: Set Active Issue
      await handleMessage('session-1', {
        type: 'set-active-issue',
        issueId: issue2Id,
      });

      // Assert
      expect(gameState.activeIssueId).toBe(issue2Id);
      expect(gameState.revealed).toBe(false);
      expect(gameState.participants.get(userId).vote).toBeUndefined();
    });

    it('should vote next issue', async () => {
      await mockState.storage.put('votingSystem', 'fibonacci');
      const handleMessage = (game as any).handleMessage.bind(game);
      const {gameState} = (game as any);

      // Join
      await handleMessage('session-1', {type: 'join', name: 'User', clientId: 'user-1'});

      // Add issues
      await handleMessage('session-1', {type: 'add-issue', issue: {title: 'Issue 1'}});
      await handleMessage('session-1', {type: 'add-issue', issue: {title: 'Issue 2'}});

      // Initially Issue 1 is active (because it was first)
      expect(gameState.activeIssueId).toBe(gameState.issues[0].id);

      // Act: Vote Next Issue
      await handleMessage('session-1', {
        type: 'vote-next-issue',
      });

      // Assert
      expect(gameState.activeIssueId).toBe(gameState.issues[1].id);
    });
  });
});
