/// <reference types="@cloudflare/workers-types" />

import { Room } from "./room";

export interface Env {
  ROOM: DurableObjectNamespace;
}

export default {
  fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    // /room/:roomId
    if (url.pathname.startsWith("/room/")) {
      const roomId = url.pathname.split("/")[2];

      if (!roomId) {
        return new Response("roomId is required", { status: 400 });
      }

      // WebSocket 以外は拒否
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket", { status: 426 });
      }

      // GET 以外は拒否
      if (request.method !== "GET") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const id = env.ROOM.idFromName(roomId);
      return env.ROOM.get(id).fetch(request);
    }

    return new Response("OK");
  },
};

export { Room };
