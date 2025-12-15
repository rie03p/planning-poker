import {getCorsHeaders} from './cors';
import {handleGameWebSocket} from './routes/gameWebSocket';
import {handleGamesRoute} from './routes/games';
import {type RegistryExistsResponse, type Env} from './types';
import {fetchJson} from './utils';

const worker = {
  async fetch(request: Request, env: Env) {
    const origin = request.headers.get('Origin');
    const corsHeaders = getCorsHeaders(origin ?? undefined);

    if (!corsHeaders) {
      return new Response('Origin not allowed', {status: 403});
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);

    // index.ts
    if (url.pathname.startsWith('/games')) {
      const response = await handleGamesRoute(
        request,
        env,
        corsHeaders,
        url,
      );
      if (response) {
        return response;
      }
    }

    // WebSocket route
    if (url.pathname.startsWith('/game/')) {
      const gameId = url.pathname.split('/')[2];
      if (!gameId) {
        return new Response('gameId is required', {status: 400});
      }

      const registry = env.REGISTRY.get(env.REGISTRY.idFromName('global'));

      const response = await registry.fetch(`http://registry/exists?gameId=${gameId}`);
      const {exists, votingSystem} = await fetchJson<RegistryExistsResponse>(response);

      if (!exists) {
        return new Response('Game not found', {status: 404});
      }

      return handleGameWebSocket(
        request,
        env,
        gameId,
        votingSystem ?? 'fibonacci',
      );
    }

    return new Response('OK', {headers: corsHeaders});
  },
};

export default worker;
export {Game} from './game';
export {GameRegistry} from './gameRegistry';
