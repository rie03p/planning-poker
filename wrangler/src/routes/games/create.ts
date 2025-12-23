import {
  type CreateGameResponse,
  type VotingSystem,
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

  let votingSystem: VotingSystem;
  try {
    const body: unknown = await request.json();
    const result = createGameRequestSchema.safeParse(body);

    if (!result.success) {
      return new Response('Invalid voting system', {status: 400});
    }

    votingSystem = result.data.votingSystem ?? 'fibonacci';
  } catch {
    return new Response('Invalid JSON', {status: 400});
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
