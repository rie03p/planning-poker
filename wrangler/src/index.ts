/// <reference types="@cloudflare/workers-types" />

import { Room } from "./room";

export interface Env {
  ROOM: DurableObjectNamespace;
}

export default {
  fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (
      url.pathname.startsWith("/room/") &&
      request.headers.get("Upgrade") === "websocket"
    ) {
      const roomId = url.pathname.split("/")[2];
      const id = env.ROOM.idFromName(roomId);
      return env.ROOM.get(id).fetch(request);
    }
    return new Response("OK");
  },
};

export { Room };
