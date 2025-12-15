import {type Env} from '../types';

export async function handleGameWebSocket(
  request: Request,
  env: Env,
  gameId: string,
  votingSystem: string,
): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', {status: 405});
  }

  if (request.headers.get('Upgrade') !== 'websocket') {
    return new Response('Expected WebSocket', {status: 426});
  }

  const id = env.GAME.idFromName(gameId);

  const url = new URL(request.url);
  url.searchParams.set('votingSystem', votingSystem);

  return env.GAME.get(id).fetch(new Request(url.toString(), request));
}
