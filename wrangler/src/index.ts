/// <reference types="@cloudflare/workers-types" />

import { Game } from "./game";

const ALLOWED_ORIGINS = [
  "https://planning-poker-ba3.pages.dev",
  "http://localhost:5173",
];

function getCorsHeaders(origin: string | null): Headers | null {
  if (!origin) return null;

  if (!ALLOWED_ORIGINS.includes(origin)) {
    return null;
  }

  return new Headers({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  });
}

export interface Env {
  GAME: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env) {
    const origin = request.headers.get("Origin");
    const corsHeaders = getCorsHeaders(origin);

    // Origin NG
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

    // POST /games - Create a new game
    if (url.pathname === "/games" && request.method === "POST") {
      try {
        const body = (await request.json()) as { votingSystem?: string };
        const votingSystem = body.votingSystem || "fibonacci";
        
        // Generate a unique game ID
        const gameId = crypto.randomUUID();
        
        const responseHeaders = new Headers(corsHeaders);
        responseHeaders.set("Content-Type", "application/json");
        
        return new Response(
          JSON.stringify({ gameId, votingSystem }),
          {
            status: 201,
            headers: responseHeaders,
          }
        );
      } catch (error) {
        const responseHeaders = new Headers(corsHeaders);
        responseHeaders.set("Content-Type", "application/json");
        
        return new Response(
          JSON.stringify({ error: "Invalid request body" }),
          {
            status: 400,
            headers: responseHeaders,
          }
        );
      }
    }

    // /game/:gameId
    if (url.pathname.startsWith("/game/")) {
      const gameId = url.pathname.split("/")[2];
      if (!gameId) {
        return new Response("gameId is required", { status: 400 });
      }

      // WebSocket only
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket", { status: 426 });
      }

      if (request.method !== "GET") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const id = env.GAME.idFromName(gameId);
      return env.GAME.get(id).fetch(request);
    }

    return new Response("OK", { headers: corsHeaders });
  },
};

export { Game };
