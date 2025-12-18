import {
  registryRegisterRequestSchema,
  registryUnregisterRequestSchema,
} from '@planning-poker/shared';

export class GameRegistry {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request) {
    const url = new URL(request.url);

    // POST /register
    if (url.pathname === '/register' && request.method === 'POST') {
      const data: unknown = await request.json();
      const {gameId, votingSystem} = registryRegisterRequestSchema.parse(data);
      await this.state.storage.put(gameId, {votingSystem});
      return new Response('ok');
    }

    // POST /unregister
    if (url.pathname === '/unregister' && request.method === 'POST') {
      const data: unknown = await request.json();
      const {gameId} = registryUnregisterRequestSchema.parse(data);
      await this.state.storage.delete(gameId);
      return new Response('ok');
    }

    // GET /exists?gameId=xxx
    if (url.pathname === '/exists' && request.method === 'GET') {
      const gameId = url.searchParams.get('gameId');
      const data = gameId
        ? await this.state.storage.get<{votingSystem: string}>(gameId)
        : null;

      return new Response(JSON.stringify({
        exists: Boolean(data),
        votingSystem: data?.votingSystem,
      }), {
        headers: {'Content-Type': 'application/json'},
      });
    }

    return new Response('Not found', {status: 404});
  }
}
