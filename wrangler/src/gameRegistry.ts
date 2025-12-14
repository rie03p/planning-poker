export class GameRegistry {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    // POST /register
    if (url.pathname === "/register" && request.method === "POST") {
      const { gameId } = await request.json() as { gameId: string };
      await this.state.storage.put(gameId, true);
      return new Response("ok");
    }

    // POST /unregister
    if (url.pathname === "/unregister" && request.method === "POST") {
      const { gameId } = await request.json() as { gameId: string };
      await this.state.storage.delete(gameId);
      return new Response("ok");
    }

    // GET /exists?gameId=xxx
    if (url.pathname === "/exists" && request.method === "GET") {
      const gameId = url.searchParams.get("gameId");
      const exists = gameId
        ? await this.state.storage.get(gameId)
        : false;

      return new Response(JSON.stringify({ exists }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }
}
