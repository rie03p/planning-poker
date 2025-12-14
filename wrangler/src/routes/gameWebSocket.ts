import { Env } from "../types";

export async function handleGameWebSocket(
  request: Request,
  env: Env,
  gameId: string
): Promise<Response> {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (request.headers.get("Upgrade") !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 });
  }

  const id = env.GAME.idFromName(gameId);
  return env.GAME.get(id).fetch(request);
}
