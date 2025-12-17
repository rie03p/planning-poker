import {getCorsHeaders} from './cors';
import {handleGameWebSocket} from './routes/gameWebSocket';
import {handleCreateGame} from './routes/games/create';
import {handleGameExists} from './routes/games/exists';
import {type Env} from './types';

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

    // POST /games
    if (url.pathname === '/games' && request.method === 'POST') {
      return handleCreateGame(request, env, corsHeaders);
    }

    // GET /games/:gameId/exists
    const parts = url.pathname.split('/');
    if (
      request.method === 'GET'
      && parts.length === 4
      && parts[1] === 'games'
      && parts[3] === 'exists'
    ) {
      return handleGameExists(request, env, corsHeaders);
    }

    // WebSocket /game/:gameId
    if (url.pathname.startsWith('/game/')) {
      return handleGameWebSocket(request, env);
    }

    return new Response('OK', {headers: corsHeaders});
  },
};

export default worker;
export {Game} from './game';
export {GameRegistry} from './gameRegistry';
