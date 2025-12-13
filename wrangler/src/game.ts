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
  private sessions: Map<string, WebSocket>;
  private gameState: GameState;

  constructor(state: DurableObjectState) {
    this.sessions = new Map();
    this.gameState = {
      participants: new Map(),
      revealed: false,
    };
  }

  async fetch(request: Request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.acceptSession(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  // WebSocket セッションを受け入れる
  private acceptSession(websocket: WebSocket): void {
    websocket.accept();

    const sessionId = this.generateSessionId();
    this.sessions.set(sessionId, websocket);

    this.setupEventListeners(websocket, sessionId);
  }

  private generateSessionId(): string {
    return crypto.randomUUID();
  }

  // Websocket Event Handler
  private setupEventListeners(websocket: WebSocket, sessionId: string): void {
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

  // セッションの切断を処理
  private handleDisconnect(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.gameState.participants.delete(sessionId);
    this.broadcastParticipantUpdate();
  }

  // メッセージを処理
  private async handleMessage(sessionId: string, data: Message): Promise<void> {
    switch (data.type) {
      case "join":
        this.handleJoin(sessionId, data.name!);
        break;
      case "vote":
        this.handleVote(sessionId, data.vote!);
        break;
      case "reveal":
        this.handleReveal();
        break;
      case "reset":
        this.handleReset();
        break;
    }
  }

  private handleJoin(sessionId: string, name: string): void {
    this.gameState.participants.set(sessionId, {
      id: sessionId,
      name,
      vote: null,
    });
    this.broadcastParticipantUpdate();
  }

  private handleVote(sessionId: string, vote: string): void {
    const participant = this.gameState.participants.get(sessionId);
    if (participant) {
      participant.vote = vote;
      this.broadcastParticipantUpdate();
    }
  }

  // 投票の公開を処理
  private handleReveal(): void {
    this.gameState.revealed = true;
    this.broadcast({
      type: "votesRevealed",
      participants: this.getParticipantsArray(),
      revealed: true,
    });
  }

  // 投票のリセットを処理
  private handleReset(): void {
    this.gameState.revealed = false;
    this.gameState.participants.forEach((p) => {
      p.vote = null;
    });
    this.broadcast({
      type: "votesReset",
      participants: this.getParticipantsArray(),
      revealed: false,
    });
  }

  // 参加者の更新を全員に通知
  private broadcastParticipantUpdate(): void {
    this.broadcast({
      type: "voteUpdated",
      participants: this.getParticipantsArray(),
      revealed: this.gameState.revealed,
    });
  }

  // 参加者の配列を取得
  private getParticipantsArray(): Participant[] {
    return Array.from(this.gameState.participants.values());
  }

  // 全セッションにメッセージを送信
  private broadcast(message: any): void {
    const messageStr = JSON.stringify(message);
    this.sessions.forEach((websocket) => {
      this.sendMessage(websocket, messageStr);
    });
  }

  private sendMessage(websocket: WebSocket, message: string): void {
    try {
      websocket.send(message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
}
