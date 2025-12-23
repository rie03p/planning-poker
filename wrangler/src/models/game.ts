import {
  type Participant,
  type VotingSystem,
  clientMessageSchema,
  serverMessageSchema,
  getCardsForVotingSystem,
  MAX_PARTICIPANTS,
} from '@planning-poker/shared';
import {type GameState, type Env} from '../types';

export class Game {
  private readonly sessions = new Map<string, WebSocket>();
  private readonly gameState: GameState = {
    participants: new Map<string, Participant>(),
    revealed: false,
  };

  constructor(private readonly state: DurableObjectState, private readonly env: Env) {}

  async fetch(request: Request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', {status: 400});
    }

    // store gameId and votingSystem once
    const url = new URL(request.url);
    const gameId = url.pathname.split('/')[2];
    const votingSystem = url.searchParams.get('votingSystem') ?? 'fibonacci';

    if (gameId) {
      await this.state.storage.put('gameId', gameId);
    }

    if (votingSystem) {
      await this.state.storage.put('votingSystem', votingSystem);
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.acceptSession(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async alarm() {
    if (this.gameState.participants.size > 0) {
      return;
    }

    const gameId = await this.state.storage.get<string>('gameId');
    if (!gameId) {
      return;
    }

    const registryId = this.env.REGISTRY.idFromName('global');
    await this.env.REGISTRY.get(registryId).fetch(
      'http://registry/unregister',
      {
        method: 'POST',
        body: JSON.stringify({gameId}),
      },
    );

    await this.state.storage.deleteAll();
    this.sessions.clear();
  }

  private acceptSession(websocket: WebSocket) {
    websocket.accept();

    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, websocket);

    this.setupEventListeners(websocket, sessionId);
  }

  private async getVotingSystem(): Promise<VotingSystem> {
    const votingSystem = await this.state.storage.get<string>('votingSystem');
    if (!votingSystem) {
      throw new Error('Voting system not found in storage');
    }

    return votingSystem as VotingSystem;
  }

  private setupEventListeners(websocket: WebSocket, sessionId: string) {
    websocket.addEventListener('message', async event => {
      try {
        const data = JSON.parse(event.data as string);
        await this.handleMessage(sessionId, data);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    websocket.addEventListener('close', async () => {
      await this.handleDisconnect(sessionId);
    });
  }

  private async handleDisconnect(sessionId: string) {
    this.sessions.delete(sessionId);
    const wasParticipant = this.gameState.participants.has(sessionId);
    this.gameState.participants.delete(sessionId);

    // Only broadcast if the disconnected session was actually a participant
    if (wasParticipant) {
      this.broadcast({
        type: 'update',
        participants: [...this.gameState.participants.values()],
        revealed: this.gameState.revealed,
      });
    }

    if (this.gameState.participants.size === 0) {
      await this.state.storage.setAlarm(Date.now() + 60_000);
    }
  }

  private async handleMessage(sessionId: string, rawData: unknown) {
    const result = clientMessageSchema.safeParse(rawData);
    if (!result.success) {
      console.error('Invalid message:', result.error);
      return;
    }

    const {data} = result;

    switch (data.type) {
      case 'join': {
        if (this.gameState.participants.size >= MAX_PARTICIPANTS) {
          const ws = this.sessions.get(sessionId);
          if (ws) {
            try {
              ws.send(JSON.stringify({type: 'room-full'}));
              ws.close(1000, 'Room is full');
            } catch (error) {
              console.error('Failed to send room-full message', error);
            }
          }
          this.sessions.delete(sessionId);
          return;
        }

        this.gameState.participants.set(sessionId, {
          id: sessionId,
          name: data.name,
          vote: undefined,
        });
        await this.state.storage.deleteAlarm();

        // Send votingSystem on join
        const votingSystem = await this.getVotingSystem();
        this.broadcast({
          type: 'joined',
          participants: [...this.gameState.participants.values()],
          revealed: this.gameState.revealed,
          votingSystem,
        });
        break;
      }

      case 'vote': {
        const p = this.gameState.participants.get(sessionId);
        if (p) {
          // Validate vote against current voting system
          const votingSystem = await this.getVotingSystem();
          const validCards = getCardsForVotingSystem(votingSystem);

          if (data.vote !== undefined && !validCards.includes(data.vote)) {
            console.error(`Invalid vote "${data.vote}" for voting system "${votingSystem}"`);
            return;
          }

          p.vote = data.vote;
          this.broadcast({
            type: 'update',
            participants: [...this.gameState.participants.values()],
            revealed: this.gameState.revealed,
          });
        }

        break;
      }

      case 'reveal': {
        this.gameState.revealed = true;
        this.broadcast({
          type: 'update',
          participants: [...this.gameState.participants.values()],
          revealed: this.gameState.revealed,
        });
        break;
      }

      case 'reset': {
        this.gameState.revealed = false;
        for (const p of this.gameState.participants.values()) {
          p.vote = undefined;
        }

        this.broadcast({
          type: 'reset',
          participants: [...this.gameState.participants.values()],
        });
        break;
      }
    }
  }

  private broadcast(message: unknown) {
    const result = serverMessageSchema.safeParse(message);
    if (!result.success) {
      console.error('Invalid server message:', result.error);
      return;
    }

    const string_ = JSON.stringify(result.data);
    for (const ws of this.sessions.values()) {
      try {
        ws.send(string_);
      } catch (error) {
        console.error('Failed to send message to session', error);
      }
    }
  }
}
