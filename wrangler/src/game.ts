import { Env } from "./types";

interface Participant {
  id: string;
  name: string;
  vote: string | null;
}

interface GameState {
  participants: Map<string, Participant>;
  revealed: boolean;
}

interface Message {
  type: string;
  name?: string;
  vote?: string;
}

export class Game {
  private sessions = new Map<string, WebSocket>();
  private gameState: GameState = {
    participants: new Map(),
    revealed: false,
  };
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    // store gameId and votingSystem once
    const url = new URL(request.url);
    const gameId = url.pathname.split("/")[2];
    const votingSystem = url.searchParams.get("votingSystem") || "fibonacci";
    
    if (gameId) {
      await this.state.storage.put("gameId", gameId);
    }
    if (votingSystem) {
      await this.state.storage.put("votingSystem", votingSystem);
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.acceptSession(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private acceptSession(websocket: WebSocket) {
    websocket.accept();

    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, websocket);

    this.setupEventListeners(websocket, sessionId);
  }

  private setupEventListeners(websocket: WebSocket, sessionId: string) {
    websocket.addEventListener("message", async (event) => {
      try {
        const data = JSON.parse(event.data as string);
        await this.handleMessage(sessionId, data);
      } catch (error) {
        console.error("Error handling message:", error);
      }
    });

    websocket.addEventListener("close", () => {
      this.handleDisconnect(sessionId);
    });
  }

  private handleDisconnect(sessionId: string) {
    this.sessions.delete(sessionId);
    this.gameState.participants.delete(sessionId);
    this.broadcastParticipant("participantLeft");

    if (this.gameState.participants.size === 0) {
      this.state.storage.setAlarm(Date.now() + 60_000);
    }
  }

  async alarm() {
    if (this.gameState.participants.size !== 0) return;

    const gameId = await this.state.storage.get<string>("gameId");
    if (!gameId) return;

    const registryId = this.env.REGISTRY.idFromName("global");
    await this.env.REGISTRY.get(registryId).fetch(
      "http://registry/unregister",
      {
        method: "POST",
        body: JSON.stringify({ gameId }),
      }
    );

    await this.state.storage.deleteAll();
    this.sessions.clear();
  }

  private async handleMessage(sessionId: string, data: Message) {
    switch (data.type) {
      case "join":
        this.gameState.participants.set(sessionId, {
          id: sessionId,
          name: data.name!,
          vote: null,
        });
        this.state.storage.deleteAlarm();
        
        // Send votingSystem on join
        this.broadcastParticipant("joined");
        this.broadcastParticipant("voteUpdated");
        break;

      case "vote":
        const p = this.gameState.participants.get(sessionId);
        if (p) {
          p.vote = data.vote!;
          this.broadcastParticipant("voteUpdated");
        }
        break;

      case "reveal":
        this.gameState.revealed = true;
        this.broadcastParticipant("votesRevealed");
        break;

      case "reset":
        this.gameState.revealed = false;
        this.gameState.participants.forEach((p) => (p.vote = null));

        this.broadcastParticipant("votesReset");
        break;
    }
  }

  private async broadcastParticipant(type: string) {
    this.broadcast({
      type: type,
      votingSystem: type !== "joined" ? undefined : await this.state.storage.get<string>("votingSystem") || "fibonacci",
      participants: Array.from(this.gameState.participants.values()),
      revealed: this.gameState.revealed,
    });
  }

  private broadcast(message: any) {
    const str = JSON.stringify(message);
    this.sessions.forEach((ws) => {
      try {
        ws.send(str);
      } catch (e) {
        console.error("Failed to send message to session", e);
      }
    });
  }
}
