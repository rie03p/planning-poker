/// <reference types="@cloudflare/workers-types" />

import {getCorsHeaders} from './cors';
import {handleGameWebSocket} from './routes/gameWebSocket';
import {
  type CreateGameResponse, isCreateGameRequest, type RegistryExistsResponse, type Env,
} from './types';
import {fetchJson} from './utils';

export const worker = {
  async fetch(request: Request, env: Env) {
    const origin = request.headers.get('Origin');
    const corsHeaders = getCorsHeaders(origin ?? undefined);

    if (!corsHeaders) {
      return new Response('Origin not allowed', {status: 403});
    }

    // CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);

    // POST /games
    if (url.pathname === '/games' && request.method === 'POST') {
      let votingSystem = 'fibonacci';

      try {
        const body: unknown = await request.json();

        if (isCreateGameRequest(body) && body.votingSystem) {
          votingSystem = body.votingSystem;
        }
      } catch {
        // invalid JSON → default votingSystem
      }

      const gameId = crypto.randomUUID();

      // register gameId
      const registryId = env.REGISTRY.idFromName('global');
      const registry = env.REGISTRY.get(registryId);

      await registry.fetch('http://registry/register', {
        method: 'POST',
        body: JSON.stringify({gameId, votingSystem}),
      });

      const headers = new Headers(corsHeaders);
      headers.set('Content-Type', 'application/json');

      const response: CreateGameResponse = {
        gameId,
        votingSystem,
      };

      return new Response(
        JSON.stringify(response),
        {status: 201, headers},
      );
    }

    // GET /games/:gameId/exists
    const pathParts = url.pathname.split('/');
    if (
      request.method === 'GET'
      && pathParts.length === 4
      && pathParts[1] === 'games'
      && pathParts[3] === 'exists'
    ) {
      const gameId = pathParts[2];
      if (!gameId) {
        return new Response('gameId is required', {status: 400});
      }

      const registryId = env.REGISTRY.idFromName('global');
      const registry = env.REGISTRY.get(registryId);

      const response = await registry.fetch(`http://registry/exists?gameId=${gameId}`);
      const {exists} = await fetchJson<RegistryExistsResponse>(response);

      const h = new Headers(corsHeaders);
      h.set('Content-Type', 'application/json');

      return new Response(JSON.stringify({exists}), {
        status: 200,
        headers: h,
      });
    }

    // /game/:gameId (WebSocket)
    if (url.pathname.startsWith('/game/')) {
      const gameId = url.pathname.split('/')[2];
      if (!gameId) {
        return new Response('gameId is required', {status: 400});
      }

      // existence check
      const registryId = env.REGISTRY.idFromName('global');
      const registry = env.REGISTRY.get(registryId);

      const response = await registry.fetch(`http://registry/exists?gameId=${gameId}`);
      const {exists, votingSystem} = await fetchJson<RegistryExistsResponse>(response);

      if (!exists) {
        return new Response('Game not found', {status: 404});
      }

      return handleGameWebSocket(request, env, gameId, votingSystem ?? 'fibonacci');
    }

    return new Response('OK', {headers: corsHeaders});
  },
};

export default worker;

export {Game} from './game';

export {GameRegistry} from './gameRegistry';
