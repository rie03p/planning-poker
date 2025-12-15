import {
  type CreateGameResponse,
  isCreateGameRequest,
  type RegistryExistsResponse,
  type Env,
} from '../types';
import {fetchJson} from '../utils';

export async function handleGamesRoute(
  request: Request,
  env: Env,
  corsHeaders: Headers,
  url: URL,
): Promise<Response | undefined> {
  // POST /games
  if (url.pathname === '/games' && request.method === 'POST') {
    let votingSystem = 'fibonacci';

    try {
      const body: unknown = await request.json();
      if (isCreateGameRequest(body) && body.votingSystem) {
        votingSystem = body.votingSystem;
      }
    } catch {
      // ignore → default
    }

    const gameId = crypto.randomUUID();

    const registry = env.REGISTRY.get(env.REGISTRY.idFromName('global'));

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

    return new Response(JSON.stringify(response), {
      status: 201,
      headers,
    });
  }

  // GET /games/:gameId/exists
  const parts = url.pathname.split('/');
  if (
    request.method === 'GET'
    && parts.length === 4
    && parts[1] === 'games'
    && parts[3] === 'exists'
  ) {
    const gameId = parts[2];
    if (!gameId) {
      return new Response('gameId is required', {status: 400});
    }

    const registry = env.REGISTRY.get(env.REGISTRY.idFromName('global'));

    const response = await registry.fetch(`http://registry/exists?gameId=${gameId}`);
    const {exists} = await fetchJson<RegistryExistsResponse>(response);

    const headers = new Headers(corsHeaders);
    headers.set('Content-Type', 'application/json');

    return new Response(JSON.stringify({exists}), {
      status: 200,
      headers,
    });
  }

  return undefined;
}
