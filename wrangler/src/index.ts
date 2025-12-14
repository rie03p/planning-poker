/// <reference types="@cloudflare/workers-types" />

import { getCorsHeaders } from "./cors";
import { handleGameWebSocket } from "./routes/gameWebSocket";
import { Env } from "./types";
import { Game } from "./game";
import { GameRegistry } from "./gameRegistry";

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

    // POST /games
    if (url.pathname === "/games" && request.method === "POST") {
      const body = await request.json().catch(() => ({})) as { votingSystem?: string };
      const votingSystem = body.votingSystem ?? "fibonacci";

      const gameId = crypto.randomUUID();

      // register gameId
      const registryId = env.REGISTRY.idFromName("global");
      const registry = env.REGISTRY.get(registryId);

      await registry.fetch("http://registry/register", {
        method: "POST",
        body: JSON.stringify({ gameId }),
      });

      const headers = new Headers(corsHeaders);
      headers.set("Content-Type", "application/json");

      return new Response(
        JSON.stringify({ gameId, votingSystem }),
        { status: 201, headers }
      );
    }

    // /game/:gameId (WebSocket)
    if (url.pathname.startsWith("/game/")) {
      const gameId = url.pathname.split("/")[2];
      if (!gameId) {
        return new Response("gameId is required", { status: 400 });
      }

      // existence check
      const registryId = env.REGISTRY.idFromName("global");
      const registry = env.REGISTRY.get(registryId);

      const res = await registry.fetch(
        `http://registry/exists?gameId=${gameId}`
      );
      const { exists } = await res.json() as { exists: boolean };

      if (!exists) {
        return new Response("Game not found", { status: 404 });
      }

      return handleGameWebSocket(request, env, gameId);
    }

    return new Response("OK", { headers: corsHeaders });
  },
};

export { Game, GameRegistry };