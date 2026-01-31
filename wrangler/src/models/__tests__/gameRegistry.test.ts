import {describe, it, expect, vi, beforeEach} from 'vitest';
import {GameRegistry} from '../gameRegistry';

// Mock DurableObjectState
const createMockState = () => {
  const storage = new Map<string, any>();
  return {
    id: {name: 'global', toString: () => 'global'},
    storage: {
      get: vi.fn(async (key: string) => storage.get(key)),
      put: vi.fn(async (key: string, value: any) => {
        storage.set(key, value);
      }),
      delete: vi.fn(async (key: string) => {
        storage.delete(key);
      }),
    },
    waitUntil: vi.fn(),
    blockConcurrencyWhile: vi.fn(),
  } as any;
};

describe('GameRegistry', () => {
  let registry: GameRegistry;
  let mockState: any;

  beforeEach(() => {
    mockState = createMockState();
    registry = new GameRegistry(mockState);
  });

  describe('POST /register', () => {
    it('should register a game with voting system', async () => {
      const request = new Request('http://registry/register', {
        method: 'POST',
        body: JSON.stringify({
          gameId: 'test-game-123',
          votingSystem: 'fibonacci',
        }),
      });

      const response = await registry.fetch(request);

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('ok');
      expect(mockState.storage.put).toHaveBeenCalledWith('test-game-123', {
        votingSystem: 'fibonacci',
      });
    });

    it('should register a game with different voting system', async () => {
      const request = new Request('http://registry/register', {
        method: 'POST',
        body: JSON.stringify({
          gameId: 'test-game-456',
          votingSystem: 't-shirts',
        }),
      });

      const response = await registry.fetch(request);

      expect(response.status).toBe(200);
      expect(mockState.storage.put).toHaveBeenCalledWith('test-game-456', {
        votingSystem: 't-shirts',
      });
    });

    it('should reject invalid register request - missing gameId', async () => {
      const request = new Request('http://registry/register', {
        method: 'POST',
        body: JSON.stringify({
          votingSystem: 'fibonacci',
        }),
      });

      await expect(registry.fetch(request)).rejects.toThrow();
    });

    it('should reject invalid register request - missing votingSystem', async () => {
      const request = new Request('http://registry/register', {
        method: 'POST',
        body: JSON.stringify({
          gameId: 'test-game-123',
        }),
      });

      await expect(registry.fetch(request)).rejects.toThrow();
    });

    it('should reject invalid register request - wrong types', async () => {
      const request = new Request('http://registry/register', {
        method: 'POST',
        body: JSON.stringify({
          gameId: 123,
          votingSystem: true,
        }),
      });

      await expect(registry.fetch(request)).rejects.toThrow();
    });
  });

  describe('POST /unregister', () => {
    it('should unregister a game', async () => {
      // First register a game
      await mockState.storage.put('test-game-123', {votingSystem: 'fibonacci'});

      const request = new Request('http://registry/unregister', {
        method: 'POST',
        body: JSON.stringify({
          gameId: 'test-game-123',
        }),
      });

      const response = await registry.fetch(request);

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('ok');
      expect(mockState.storage.delete).toHaveBeenCalledWith('test-game-123');
    });

    it('should reject invalid unregister request - missing gameId', async () => {
      const request = new Request('http://registry/unregister', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      await expect(registry.fetch(request)).rejects.toThrow();
    });

    it('should reject invalid unregister request - wrong type', async () => {
      const request = new Request('http://registry/unregister', {
        method: 'POST',
        body: JSON.stringify({
          gameId: 123,
        }),
      });

      await expect(registry.fetch(request)).rejects.toThrow();
    });
  });

  describe('GET /exists', () => {
    it('should return true for existing game', async () => {
      // Register a game
      await mockState.storage.put('test-game-123', {votingSystem: 'fibonacci'});

      const request = new Request('http://registry/exists?gameId=test-game-123', {
        method: 'GET',
      });

      const response = await registry.fetch(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(data).toEqual({
        exists: true,
        votingSystem: 'fibonacci',
      });
    });

    it('should return false for non-existing game', async () => {
      const request = new Request('http://registry/exists?gameId=non-existent', {
        method: 'GET',
      });

      const response = await registry.fetch(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        exists: false,
        votingSystem: undefined,
      });
    });

    it('should return false when gameId is not provided', async () => {
      const request = new Request('http://registry/exists', {
        method: 'GET',
      });

      const response = await registry.fetch(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        exists: false,
        votingSystem: undefined,
      });
    });

    it('should return correct voting system for tshirt', async () => {
      await mockState.storage.put('test-game-tshirt', {votingSystem: 'tshirt'});

      const request = new Request('http://registry/exists?gameId=test-game-tshirt', {
        method: 'GET',
      });

      const response = await registry.fetch(request);
      const data = await response.json();

      expect(data).toEqual({
        exists: true,
        votingSystem: 'tshirt',
      });
    });
  });

  describe('Unknown routes', () => {
    it('should return 404 for unknown paths', async () => {
      const request = new Request('http://registry/unknown', {
        method: 'GET',
      });

      const response = await registry.fetch(request);

      expect(response.status).toBe(404);
      expect(await response.text()).toBe('Not found');
    });

    it('should return 404 for unsupported methods', async () => {
      const request = new Request('http://registry/exists', {
        method: 'POST',
      });

      const response = await registry.fetch(request);

      expect(response.status).toBe(404);
    });
  });
});
