import {
  type CreateGameResponse,
  createGameRequestSchema,
} from '@planning-poker/shared';
import {type Env} from '../../types';

export async function handleCreateGame(
  request: Request,
  env: Env,
  corsHeaders: Headers,
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {status: 405});
  }

  let votingSystem = 'fibonacci';

  try {
    const body: unknown = await request.json();
    const result = createGameRequestSchema.safeParse(body);
    if (result.success && result.data.votingSystem) {
      votingSystem = result.data.votingSystem;
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
