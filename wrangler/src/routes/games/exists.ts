import {registryExistsResponseSchema} from '@planning-poker/shared';
import {type Env} from '../../types';

export async function handleGameExists(
  request: Request,
  env: Env,
  corsHeaders: Headers,
): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', {status: 405});
  }

  const url = new URL(request.url);
  const gameId = url.pathname.split('/')[2];

  if (!gameId) {
    return new Response('gameId is required', {status: 400});
  }

  const registry = env.REGISTRY.get(env.REGISTRY.idFromName('global'));

  const response = await registry.fetch(`http://registry/exists?gameId=${gameId}`);
  const data: unknown = await response.json();
  const {exists} = registryExistsResponseSchema.parse(data);

  const headers = new Headers(corsHeaders);
  headers.set('Content-Type', 'application/json');

  return new Response(JSON.stringify({exists}), {
    status: 200,
    headers,
  });
}
