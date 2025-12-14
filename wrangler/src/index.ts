/// <reference types="@cloudflare/workers-types" />

import { getCorsHeaders } from "./cors";
import { handleGameWebSocket } from "./routes/gameWebSocket";
import { Env } from "./types";
import { Game } from "./game";

export default {
  async fetch(request: Request, env: Env) {
    const origin = request.headers.get("Origin");
    const corsHeaders = getCorsHeaders(origin);

    if (!corsHeaders) {
      return new Response("Origin not allowed", { status: 403 });
    }

    // CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);

    // /game/:gameId (WebSocket)
    if (url.pathname.startsWith("/game/")) {
      const gameId = url.pathname.split("/")[2];
      if (!gameId) {
        return new Response("gameId is required", { status: 400 });
      }

      return handleGameWebSocket(request, env, gameId);
    }

    return new Response("OK", { headers: corsHeaders });
  },
};

export { Game };
