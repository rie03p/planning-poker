/// <reference types="@cloudflare/workers-types" />

import { Game } from "./game";

export interface Env {
  GAME: DurableObjectNamespace;
}

export default {
  fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    // /game/:gameId
    if (url.pathname.startsWith("/game/")) {
      const gameId = url.pathname.split("/")[2];

      if (!gameId) {
        return new Response("gameId is required", { status: 400 });
      }

      // WebSocket 以外は拒否
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket", { status: 426 });
      }

      // GET 以外は拒否
      if (request.method !== "GET") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const id = env.GAME.idFromName(gameId);
      return env.GAME.get(id).fetch(request);
    }

    return new Response("OK");
  },
};

export { Game };
