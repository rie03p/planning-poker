/// <reference types="@cloudflare/workers-types" />

import { Game } from "./game";

const ALLOWED_ORIGINS = [
  "https://planning-poker-ba3.pages.dev/",
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin === allowed || origin.startsWith(allowed));
}

export interface Env {
  GAME: DurableObjectNamespace;
}

export default {
  fetch(request: Request, env: Env) {
    // CORS Preflight Request
    if (request.method === "OPTIONS") {
      const origin = request.headers.get("Origin");
      if (isOriginAllowed(origin)) {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": origin!,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
          },
        });
      } else {
        return new Response("Origin not allowed", { status: 403 });
      }
    }

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
