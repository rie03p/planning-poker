import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
import {handleGameWebSocket} from '../gameWebSocket';
import type {Env} from '../../types';

const createMockEnv = (): Env => {
  const mockGameInstance = {
    fetch: vi.fn(async (request: Request) =>
      new Response('OK', {status: 200})),
  };

  const mockRegistryInstance = {
    fetch: vi.fn(async () =>
      new Response(
        JSON.stringify({exists: true, votingSystem: 'fibonacci'}),
        {headers: {'Content-Type': 'application/json'}},
      )),
  };

  return {
    GAME: {
      idFromName: vi.fn(() => ({})),
      get: vi.fn(() => mockGameInstance),
    },
    REGISTRY: {
      idFromName: vi.fn(() => ({})),
      get: vi.fn(() => mockRegistryInstance),
    },
  } as any;
};

describe('handleGameWebSocket', () => {
  let mockEnv: Env;

  beforeEach(() => {
    mockEnv = createMockEnv();
  });

  it('should return 400 if gameId is missing', async () => {
    const request = new Request('http://localhost/game/', {
      method: 'GET',
      headers: {Upgrade: 'websocket'},
    });

    const response = await handleGameWebSocket(request, mockEnv);

    expect(response.status).toBe(400);
    expect(await response.text()).toBe('gameId is required');
  });

  it('should return 405 for non-GET requests', async () => {
    const request = new Request('http://localhost/game/test-game', {
      method: 'POST',
      headers: {Upgrade: 'websocket'},
    });

    const response = await handleGameWebSocket(request, mockEnv);

    expect(response.status).toBe(405);
    expect(await response.text()).toBe('Method Not Allowed');
  });

  it('should return 426 for non-WebSocket requests', async () => {
    const request = new Request('http://localhost/game/test-game', {
      method: 'GET',
    });

    const response = await handleGameWebSocket(request, mockEnv);

    expect(response.status).toBe(426);
    expect(await response.text()).toBe('Expected WebSocket');
  });

  it('should return 404 if game does not exist', async () => {
    const mockRegistryInstance = {
      fetch: vi.fn(async () =>
        new Response(
          JSON.stringify({exists: false, votingSystem: 'fibonacci'}),
          {headers: {'Content-Type': 'application/json'}},
        )),
    };

    mockEnv.REGISTRY.get = vi.fn(() => mockRegistryInstance) as any;

    const request = new Request('http://localhost/game/non-existent', {
      method: 'GET',
      headers: {Upgrade: 'websocket'},
    });

    const response = await handleGameWebSocket(request, mockEnv);

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Game not found');
  });

  it('should forward request to game durable object for existing game', async () => {
    const mockGameInstance = {
      fetch: vi.fn(async () =>
        new Response('OK', {status: 200})),
    };

    mockEnv.GAME.get = vi.fn(() => mockGameInstance) as any;

    const request = new Request('http://localhost/game/test-game', {
      method: 'GET',
      headers: {Upgrade: 'websocket'},
    });

    await handleGameWebSocket(request, mockEnv);

    expect(mockEnv.REGISTRY.get).toHaveBeenCalled();
    expect(mockEnv.GAME.idFromName).toHaveBeenCalledWith('test-game');
    expect(mockGameInstance.fetch).toHaveBeenCalled();
  });
});
