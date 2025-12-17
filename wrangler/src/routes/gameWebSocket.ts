import {type RegistryExistsResponse} from '@planning-poker/shared';
import {type Env} from '../types';
import {fetchJson} from '../utils';

export async function handleGameWebSocket(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);

  const gameId = url.pathname.split('/')[2];
  if (!gameId) {
    return new Response('gameId is required', {status: 400});
  }

  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', {status: 405});
  }

  if (request.headers.get('Upgrade') !== 'websocket') {
    return new Response('Expected WebSocket', {status: 426});
  }

  const registry = env.REGISTRY.get(env.REGISTRY.idFromName('global'));
  const response = await registry.fetch(`http://registry/exists?gameId=${gameId}`);
  const {exists, votingSystem} = await fetchJson<RegistryExistsResponse>(response);

  if (!exists) {
    return new Response('Game not found', {status: 404});
  }

  const id = env.GAME.idFromName(gameId);
  url.searchParams.set('votingSystem', votingSystem ?? 'fibonacci');

  return env.GAME.get(id).fetch(new Request(url.toString(), request));
}
