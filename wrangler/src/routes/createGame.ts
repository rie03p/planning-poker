import { CreateGameRequest, CreateGameResponse } from "../types";

function json<T>(body: T, status: number, headers: Headers): Response {
  const h = new Headers(headers);
  h.set("Content-Type", "application/json");
  return new Response(JSON.stringify(body), { status, headers: h });
}

export async function handleCreateGame(
  request: Request,
  corsHeaders: Headers
): Promise<Response> {
  let body: CreateGameRequest;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400, corsHeaders);
  }

  const votingSystem = body.votingSystem ?? "fibonacci";
  const gameId = crypto.randomUUID();

  return json<CreateGameResponse>(
    { gameId, votingSystem },
    201,
    corsHeaders
  );
}
