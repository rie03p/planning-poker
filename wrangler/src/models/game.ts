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
  private readonly sessionToUserId = new Map<string, string>();
  private readonly gameState: GameState = {
    participants: new Map<string, Participant>(),
    revealed: false,
    issues: [],
    activeIssueId: undefined,
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
    const userId = this.sessionToUserId.get(sessionId);
    this.sessionToUserId.delete(sessionId);

    if (!userId) {
      return;
    }

    // Check if the user has any other active sessions
    const hasOtherSession = [...this.sessionToUserId.values()].includes(userId);
    if (hasOtherSession) {
      return;
    }

    const wasParticipant = this.gameState.participants.has(userId);
    this.gameState.participants.delete(userId);

    // Only broadcast if the disconnected session was actually a participant
    if (wasParticipant) {
      this.broadcast({
        type: 'update',
        participants: [...this.gameState.participants.values()],
        revealed: this.gameState.revealed,
        activeIssueId: this.gameState.activeIssueId,
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
        const {clientId} = data;

        const userId = clientId && this.gameState.participants.has(clientId)
          ? clientId
          : crypto.randomUUID();

        if (this.gameState.participants.size >= MAX_PARTICIPANTS && !this.gameState.participants.has(userId)) {
          const ws = this.sessions.get(sessionId);
          if (ws) {
            try {
              ws.send(JSON.stringify({type: 'room-full'}));
              ws.close(1000, 'Room is full');
            } catch (error) {
              console.error('Failed to send room-full message', error);
            }
          }

          return;
        }

        this.sessionToUserId.set(sessionId, userId);

        const existingParticipant = this.gameState.participants.get(userId);
        if (existingParticipant) {
          existingParticipant.name = data.name;
        } else {
          this.gameState.participants.set(userId, {
            id: userId,
            name: data.name,
            vote: undefined,
          });
        }

        await this.state.storage.deleteAlarm();

        // Send votingSystem on join with assigned userId
        const votingSystem = await this.getVotingSystem();
        const ws = this.sessions.get(sessionId);
        if (ws) {
          ws.send(JSON.stringify({
            type: 'joined',
            userId,
            participants: [...this.gameState.participants.values()],
            revealed: this.gameState.revealed,
            votingSystem,
            issues: this.gameState.issues,
            activeIssueId: this.gameState.activeIssueId,
          }));
        }

        // Broadcast update to others
        this.broadcast({
          type: 'update',
          participants: [...this.gameState.participants.values()],
          revealed: this.gameState.revealed,
          activeIssueId: this.gameState.activeIssueId,
        }, sessionId);
        break;
      }

      case 'vote': {
        const userId = this.sessionToUserId.get(sessionId);
        if (!userId) {
          return;
        }

        const p = this.gameState.participants.get(userId);
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
            activeIssueId: this.gameState.activeIssueId,
          });
        }

        break;
      }

      case 'reveal': {
        this.gameState.revealed = true;

        // Save vote results to active issue
        if (this.gameState.activeIssueId) {
          const voteResults: Record<string, number> = {};
          for (const p of this.gameState.participants.values()) {
            if (p.vote) {
              voteResults[p.vote] = (voteResults[p.vote] ?? 0) + 1;
            }
          }

          const issueIndex = this.gameState.issues.findIndex(i => i.id === this.gameState.activeIssueId);
          if (issueIndex !== -1) {
            this.gameState.issues[issueIndex] = {
              ...this.gameState.issues[issueIndex],
              voteResults,
            };
            this.broadcast({
              type: 'issue-updated',
              issue: this.gameState.issues[issueIndex],
            });
          }
        }

        this.broadcast({
          type: 'update',
          participants: [...this.gameState.participants.values()],
          revealed: this.gameState.revealed,
          activeIssueId: this.gameState.activeIssueId,
        });
        break;
      }

      case 'reset': {
        this.gameState.revealed = false;
        this.gameState.activeIssueId = undefined;
        for (const p of this.gameState.participants.values()) {
          p.vote = undefined;
        }

        this.broadcast({
          type: 'reset',
          participants: [...this.gameState.participants.values()],
          issues: this.gameState.issues,
          activeIssueId: this.gameState.activeIssueId,
        });
        break;
      }

      case 'add-issue': {
        const newIssue = {
          id: crypto.randomUUID(),
          ...data.issue,
        };
        this.gameState.issues.push(newIssue);

        // If it's the first issue, set it as active
        const isFirstIssue = this.gameState.issues.length === 1;
        if (isFirstIssue) {
          this.gameState.activeIssueId = newIssue.id;
        }

        this.broadcast({
          type: 'issue-added',
          issue: newIssue,
        });

        // specific update for activeIssueId if it changed (first issue)
        if (isFirstIssue) {
          this.broadcast({
            type: 'update',
            participants: [...this.gameState.participants.values()],
            revealed: this.gameState.revealed,
            activeIssueId: this.gameState.activeIssueId,
          });
        }

        break;
      }

      case 'remove-issue': {
        const previousActiveIssueId = this.gameState.activeIssueId;

        this.gameState.issues = this.gameState.issues.filter(i => i.id !== data.issueId);

        if (this.gameState.activeIssueId === data.issueId) {
          this.gameState.activeIssueId = undefined;
        }

        this.broadcast({
          type: 'issue-removed',
          issueId: data.issueId,
        });

        if (previousActiveIssueId !== this.gameState.activeIssueId) {
          this.broadcast({
            type: 'update',
            participants: [...this.gameState.participants.values()],
            revealed: this.gameState.revealed,
            activeIssueId: this.gameState.activeIssueId,
          });
        }

        break;
      }

      case 'set-active-issue': {
        this.setActiveIssue(data.issueId);
        break;
      }

      case 'vote-next-issue': {
        const currentIndex = this.gameState.issues.findIndex(i => i.id === this.gameState.activeIssueId);
        if (currentIndex !== -1 && currentIndex < this.gameState.issues.length - 1) {
          const nextIssue = this.gameState.issues[currentIndex + 1];
          this.setActiveIssue(nextIssue.id);
        }

        break;
      }

      case 'update-issue': {
        const issueIndex = this.gameState.issues.findIndex(i => i.id === data.issue.id);
        if (issueIndex === -1) {
          return;
        }

        const existingIssue = this.gameState.issues[issueIndex];
        this.gameState.issues[issueIndex] = {
          ...data.issue,
          id: existingIssue.id, // Ensure the ID cannot be changed by the client
        };

        this.broadcast({
          type: 'issue-updated',
          issue: this.gameState.issues[issueIndex],
        });
        break;
      }
    }
  }

  private setActiveIssue(issueId: string) {
    if (this.gameState.activeIssueId === issueId) {
      return;
    }

    this.gameState.activeIssueId = issueId;
    this.gameState.revealed = false;
    for (const p of this.gameState.participants.values()) {
      p.vote = undefined;
    }

    this.broadcast({
      type: 'update',
      participants: [...this.gameState.participants.values()],
      revealed: this.gameState.revealed,
      activeIssueId: this.gameState.activeIssueId,
    });
  }

  private broadcast(message: unknown, excludeSessionId?: string) {
    const result = serverMessageSchema.safeParse(message);
    if (!result.success) {
      console.error('Invalid server message:', result.error);
      return;
    }

    const string_ = JSON.stringify(result.data);
    for (const [sessionId, ws] of this.sessions.entries()) {
      if (excludeSessionId && sessionId === excludeSessionId) {
        continue;
      }

      try {
        ws.send(string_);
      } catch (error) {
        console.error('Failed to send message to session', error);
      }
    }
  }
}
