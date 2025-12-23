import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
import {handleCreateGame} from '../create';
import type {Env} from '../../../types';

const createMockEnv = (): Env => {
  const mockRegistryInstance = {
    fetch: vi.fn(async () =>
      new Response('OK', {status: 200})),
  };

  return {
    GAME: {
      idFromName: vi.fn(() => ({})),
      get: vi.fn(() => ({})),
    },
    REGISTRY: {
      idFromName: vi.fn(() => ({})),
      get: vi.fn(() => mockRegistryInstance),
    },
  } as any;
};

describe('handleCreateGame', () => {
  let mockEnv: Env;
  let corsHeaders: Headers;

  beforeEach(() => {
    mockEnv = createMockEnv();
    corsHeaders = new Headers({'Access-Control-Allow-Origin': '*'});
    // Mock crypto.randomUUID
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'test-uuid-1234'),
    });
  });

  it('should return 405 for non-POST requests', async () => {
    const request = new Request('http://localhost/games', {
      method: 'GET',
    });

    const response = await handleCreateGame(request, mockEnv, corsHeaders);

    expect(response.status).toBe(405);
    expect(await response.text()).toBe('Method Not Allowed');
  });

  it('should create game with default fibonacci voting system', async () => {
    const request = new Request('http://localhost/games', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await handleCreateGame(request, mockEnv, corsHeaders);

    expect(response.status).toBe(201);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const data = await response.json();
    expect(data).toEqual({
      gameId: 'test-uuid-1234',
      votingSystem: 'fibonacci',
    });
  });

  it.each([
    't-shirts',
    'modified-fibonacci',
    'powers-of-2',
  ])('should create game with %s voting system', async votingSystem => {
    const request = new Request('http://localhost/games', {
      method: 'POST',
      body: JSON.stringify({votingSystem}),
    });

    const response = await handleCreateGame(request, mockEnv, corsHeaders);

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data).toEqual({
      gameId: 'test-uuid-1234',
      votingSystem,
    });
  });

  it('should return 400 for invalid voting system', async () => {
    const request = new Request('http://localhost/games', {
      method: 'POST',
      body: JSON.stringify({votingSystem: 'invalid-system'}),
    });

    const response = await handleCreateGame(request, mockEnv, corsHeaders);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain('Invalid voting system');
  });

  it('should return 400 for invalid JSON', async () => {
    const request = new Request('http://localhost/games', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await handleCreateGame(request, mockEnv, corsHeaders);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain('Invalid JSON');
  });

  it('should register game in registry', async () => {
    const mockRegistryInstance = {
      fetch: vi.fn(async () =>
        new Response('OK', {status: 200})),
    };

    mockEnv.REGISTRY.get = vi.fn(() => mockRegistryInstance) as any;

    const request = new Request('http://localhost/games', {
      method: 'POST',
      body: JSON.stringify({votingSystem: 't-shirts'}),
    });

    await handleCreateGame(request, mockEnv, corsHeaders);

    expect(mockEnv.REGISTRY.idFromName).toHaveBeenCalledWith('global');
    expect(mockRegistryInstance.fetch).toHaveBeenCalledWith(
      'http://registry/register',
      {
        method: 'POST',
        body: JSON.stringify({
          gameId: 'test-uuid-1234',
          votingSystem: 't-shirts',
        }),
      },
    );
  });

  it('should include CORS headers in response', async () => {
    const customCorsHeaders = new Headers({
      'Access-Control-Allow-Origin': 'https://example.com',
      'Access-Control-Allow-Methods': 'POST',
    });

    const request = new Request('http://localhost/games', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await handleCreateGame(request, mockEnv, customCorsHeaders);

    expect(response.status).toBe(201);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST');
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });
});
