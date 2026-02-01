import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useGame} from '../useGame';

describe('useGame', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(
      async () => new Response(JSON.stringify({exists: true}), {status: 200}),
    );
    globalThis.console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends join message on websocket open', () => {
    const getWs = mockWebSocket();

    renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({type: 'join', name: 'Alice', clientId: 'user-id-alice'}),
    );
  });

  it('updates participants when joined message is received', async () => {
    const getWs = mockWebSocket();

    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    ws.emitMessage({
      type: 'joined',
      userId: 'user-id-alice',
      votingSystem: 'fibonacci',
      participants: [
        {id: 'user-id-alice', name: 'Alice', vote: undefined},
        {id: '2', name: 'Bob', vote: undefined},
      ],
      revealed: false,
      issues: [],
      activeIssueId: undefined,
    });

    await vi.waitFor(() => {
      expect(result.current.participants).toHaveLength(2);
      expect(result.current.participants[0].name).toBe('Alice');
      expect(result.current.participants[1].name).toBe('Bob');
      expect(result.current.votingSystem).toBe('fibonacci');
      expect(result.current.revealed).toBe(false);
    });
  });

  it('updates participants when update message is received', async () => {
    const getWs = mockWebSocket();

    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    ws.emitMessage({
      type: 'update',
      participants: [
        {id: 'user-id-alice', name: 'Alice', vote: '5'},
        {id: '2', name: 'Bob', vote: '8'},
      ],
      revealed: true,
      issues: [],
      activeIssueId: undefined,
    });

    await vi.waitFor(() => {
      expect(result.current.participants).toHaveLength(2);
      expect(result.current.participants[0].vote).toBe('5');
      expect(result.current.participants[1].vote).toBe('8');
      expect(result.current.revealed).toBe(true);
    });
  });

  it('sends vote message and updates local vote', async () => {
    const getWs = mockWebSocket();

    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    result.current.vote('5');

    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({type: 'vote', vote: '5'}));
    await vi.waitFor(() => {
      expect(result.current.myVote).toBe('5');
    });
  });

  it('sends reveal message', () => {
    const getWs = mockWebSocket();

    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    result.current.reveal();

    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({type: 'reveal'}));
  });

  it('sends reset message and clears local vote', async () => {
    const getWs = mockWebSocket();
    const onUserIdChange = vi.fn();

    const {result} = renderHook(() =>
      useGame('test-game', 'Alice', 'user-id-alice', onUserIdChange),
    );

    const ws = getWs();
    ws.emitOpen();

    // Wait for connection to be established
    ws.emitMessage({
      type: 'joined',
      userId: 'user-id-alice',
      votingSystem: 'fibonacci',
      participants: [{id: 'user-id-alice', name: 'Alice', vote: undefined}],
      revealed: false,
      issues: [],
      activeIssueId: undefined,
    });

    await vi.waitFor(() => {
      expect(result.current.participants).toHaveLength(1);
    });

    result.current.vote('5');
    await vi.waitFor(() => {
      expect(result.current.myVote).toBe('5');
    });

    result.current.reset();

    // Check that reset was called
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({type: 'reset'}));
    await vi.waitFor(() => {
      expect(result.current.myVote).toBeUndefined();
    });
  });

  it('resets participants and vote when reset message is received', async () => {
    const getWs = mockWebSocket();

    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    result.current.vote('8');
    await vi.waitFor(() => {
      expect(result.current.myVote).toBe('8');
    });

    ws.emitMessage({
      type: 'reset',
      participants: [
        {id: 'user-id-alice', name: 'Alice', vote: undefined},
        {id: '2', name: 'Bob', vote: undefined},
      ],
      issues: [],
      activeIssueId: undefined,
    });

    await vi.waitFor(() => {
      expect(result.current.participants).toHaveLength(2);
      expect(result.current.participants[0].vote).toBeUndefined();
      expect(result.current.participants[1].vote).toBeUndefined();
      expect(result.current.myVote).toBeUndefined();
      expect(result.current.revealed).toBe(false);
    });
  });

  it('closes websocket on disconnect', () => {
    const getWs = mockWebSocket();

    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    result.current.disconnect();

    expect(ws.close).toHaveBeenCalled();
  });

  it('sets notFound when not-found message is received', async () => {
    const getWs = mockWebSocket();

    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    ws.emitMessage({
      type: 'not-found',
    });

    await vi.waitFor(() => {
      expect(result.current.notFound).toBe(true);
    });
  });

  it('sets notFound when game does not exist', async () => {
    globalThis.fetch = vi.fn(
      async () => new Response(JSON.stringify({exists: false}), {status: 200}),
    );

    const getWs = mockWebSocket();

    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    await vi.waitFor(() => {
      expect(result.current.notFound).toBe(true);
    });
  });

  it('sets notFound when fetch fails', async () => {
    globalThis.fetch = vi.fn(async () => new Response(null, {status: 404}));

    const getWs = mockWebSocket();

    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    await vi.waitFor(() => {
      expect(result.current.notFound).toBe(true);
    });
  });

  it('allows changing vote', async () => {
    const getWs = mockWebSocket();

    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    result.current.vote('5');
    await vi.waitFor(() => {
      expect(result.current.myVote).toBe('5');
    });

    result.current.vote('8');
    await vi.waitFor(() => {
      expect(result.current.myVote).toBe('8');
    });
  });

  it('allows clearing vote by passing undefined', async () => {
    const getWs = mockWebSocket();
    const onUserIdChange = vi.fn();

    const {result} = renderHook(() =>
      useGame('test-game', 'Alice', 'user-id-alice', onUserIdChange),
    );

    const ws = getWs();
    ws.emitOpen();

    // Wait for connection to be established
    ws.emitMessage({
      type: 'joined',
      userId: 'user-id-alice',
      votingSystem: 'fibonacci',
      participants: [{id: 'user-id-alice', name: 'Alice', vote: undefined}],
      revealed: false,
      issues: [],
      activeIssueId: undefined,
    });

    await vi.waitFor(() => {
      expect(result.current.participants).toHaveLength(1);
    });

    result.current.vote('5');
    await vi.waitFor(() => {
      expect(result.current.myVote).toBe('5');
    });

    result.current.vote(undefined);
    await vi.waitFor(() => {
      expect(result.current.myVote).toBeUndefined();
    });

    // Check that vote with undefined was called
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({type: 'vote', vote: undefined}));
  });

  it('syncs myVote with server state when update message is received', async () => {
    const getWs = mockWebSocket();

    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    // User votes
    result.current.vote('5');
    await vi.waitFor(() => {
      expect(result.current.myVote).toBe('5');
    });

    // Server sends update message (e.g., issue changed, votes reset)
    ws.emitMessage({
      type: 'update',
      participants: [
        {id: 'user-id-alice', name: 'Alice', vote: undefined},
        {id: '2', name: 'Bob', vote: undefined},
      ],
      revealed: false,
      issues: [],
      activeIssueId: 'issue-2',
    });

    // myVote should be synced with server state
    await vi.waitFor(() => {
      expect(result.current.myVote).toBeUndefined();
      expect(result.current.participants[0].vote).toBeUndefined();
    });
  });

  it('syncs myVote when another participant with same name votes', async () => {
    const getWs = mockWebSocket();

    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    // Server sends update message with vote
    ws.emitMessage({
      type: 'update',
      participants: [
        {id: 'user-id-alice', name: 'Alice', vote: '8'},
        {id: '2', name: 'Bob', vote: '5'},
      ],
      revealed: false,
      issues: [],
      activeIssueId: 'issue-1',
    });

    // myVote should be synced with server state
    await vi.waitFor(() => {
      expect(result.current.myVote).toBe('8');
      expect(result.current.participants[0].vote).toBe('8');
    });
  });

  it('handles update message when participant with same name is not found', async () => {
    const getWs = mockWebSocket();

    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    result.current.vote('5');
    await vi.waitFor(() => {
      expect(result.current.myVote).toBe('5');
    });

    // Server sends update message without Alice
    ws.emitMessage({
      type: 'update',
      participants: [{id: '2', name: 'Bob', vote: '8'}],
      revealed: false,
      issues: [],
      activeIssueId: 'issue-1',
    });

    // myVote should be undefined when participant is not found
    await vi.waitFor(() => {
      expect(result.current.myVote).toBeUndefined();
    });
  });

  it('sends add-issue message', () => {
    const getWs = mockWebSocket();
    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));
    const ws = getWs();
    ws.emitOpen();

    result.current.addIssue('New Issue', 'Description', 'http://example.com');

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'add-issue',
        issue: {title: 'New Issue', description: 'Description', url: 'http://example.com'},
      }),
    );
  });

  it('sends remove-issue message', () => {
    const getWs = mockWebSocket();
    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));
    const ws = getWs();
    ws.emitOpen();

    result.current.removeIssue('issue-1');

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'remove-issue',
        issueId: 'issue-1',
      }),
    );
  });

  it('sends set-active-issue message', () => {
    const getWs = mockWebSocket();
    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));
    const ws = getWs();
    ws.emitOpen();

    result.current.setActiveIssue('issue-2');

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'set-active-issue',
        issueId: 'issue-2',
      }),
    );
  });

  it('sends vote-next-issue message', () => {
    const getWs = mockWebSocket();
    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));
    const ws = getWs();
    ws.emitOpen();

    result.current.voteNextIssue();

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'vote-next-issue',
      }),
    );
  });

  it('sends update-issue message', () => {
    const getWs = mockWebSocket();
    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));
    const ws = getWs();
    ws.emitOpen();

    const issue = {
      id: 'issue-1',
      title: 'Updated Title',
      description: 'Updated Desc',
      url: 'http://updated.com',
    };
    result.current.updateIssue(issue);

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'update-issue',
        issue,
      }),
    );
  });

  it('sets roomFull when room-full message is received', async () => {
    const getWs = mockWebSocket();
    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));
    const ws = getWs();
    ws.emitOpen();

    ws.emitMessage({
      type: 'room-full',
    });

    await vi.waitFor(() => {
      expect(result.current.roomFull).toBe(true);
    });
  });

  it('adds issue when issue-added message is received', async () => {
    const getWs = mockWebSocket();
    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));
    const ws = getWs();
    ws.emitOpen();

    const newIssue = {id: 'issue-1', title: 'New Issue'};

    ws.emitMessage({
      type: 'issue-added',
      issue: newIssue,
    });

    await vi.waitFor(() => {
      expect(result.current.issues).toHaveLength(1);
      expect(result.current.issues[0]).toEqual(newIssue);
    });
  });

  it('removes issue when issue-removed message is received', async () => {
    const getWs = mockWebSocket();
    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));
    const ws = getWs();
    ws.emitOpen();

    // Initial state with one issue
    ws.emitMessage({
      type: 'joined',
      userId: 'user-id-alice',
      votingSystem: 'fibonacci',
      participants: [],
      revealed: false,
      issues: [{id: 'issue-1', title: 'Issue 1'}],
      activeIssueId: undefined,
    });

    await vi.waitFor(() => {
      expect(result.current.issues).toHaveLength(1);
    });

    ws.emitMessage({
      type: 'issue-removed',
      issueId: 'issue-1',
    });

    await vi.waitFor(() => {
      expect(result.current.issues).toHaveLength(0);
    });
  });

  it('updates issue when issue-updated message is received', async () => {
    const getWs = mockWebSocket();
    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));
    const ws = getWs();
    ws.emitOpen();

    // Initial state
    ws.emitMessage({
      type: 'joined',
      userId: 'user-id-alice',
      votingSystem: 'fibonacci',
      participants: [],
      revealed: false,
      issues: [{id: 'issue-1', title: 'Issue 1'}],
      activeIssueId: undefined,
    });

    await vi.waitFor(() => {
      expect(result.current.issues[0].title).toBe('Issue 1');
    });

    const updatedIssue = {id: 'issue-1', title: 'Updated Title'};

    ws.emitMessage({
      type: 'issue-updated',
      issue: updatedIssue,
    });

    await vi.waitFor(() => {
      expect(result.current.issues[0].title).toBe('Updated Title');
    });
  });

  it('preserves issues when update message does not contain issues', async () => {
    const getWs = mockWebSocket();
    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));
    const ws = getWs();
    ws.emitOpen();

    // Initial state
    ws.emitMessage({
      type: 'joined',
      userId: 'user-id-alice',
      votingSystem: 'fibonacci',
      participants: [],
      revealed: false,
      issues: [{id: 'issue-1', title: 'Issue 1'}],
      activeIssueId: undefined,
    });

    await vi.waitFor(() => {
      expect(result.current.issues).toHaveLength(1);
    });

    // Update message without issues
    ws.emitMessage({
      type: 'update',
      participants: [],
      revealed: true,
      activeIssueId: undefined,
      // issues field is missing
    });

    await vi.waitFor(() => {
      expect(result.current.revealed).toBe(true);
      expect(result.current.issues).toHaveLength(1); // Should still have the issue
    });
  });

  it('sends remove-all-issues message', () => {
    const getWs = mockWebSocket();
    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));
    const ws = getWs();
    ws.emitOpen();

    result.current.removeAllIssues();

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'remove-all-issues',
      }),
    );
  });

  it('calls onUserIdChange when userId changes', async () => {
    const getWs = mockWebSocket();
    const onUserIdChange = vi.fn();

    renderHook(() => useGame('test-game', 'Alice', 'initial-id', onUserIdChange));

    const ws = getWs();
    ws.emitOpen();

    ws.emitMessage({
      type: 'joined',
      userId: 'new-user-id',
      votingSystem: 'fibonacci',
      participants: [{id: 'new-user-id', name: 'Alice', vote: undefined}],
      revealed: false,
      issues: [],
      activeIssueId: undefined,
    });

    await vi.waitFor(() => {
      expect(onUserIdChange).toHaveBeenCalledWith('new-user-id');
    });
  });

  it('handles errors in fetch gracefully', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('Network error');
    });

    const getWs = mockWebSocket();
    const {result} = renderHook(() => useGame('test-game', 'Alice', 'user-id-alice', vi.fn()));

    const ws = getWs();
    ws.emitOpen();

    await vi.waitFor(() => {
      expect(result.current.notFound).toBe(true);
    });
  });
});

type MockWsInstance = {
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  emitOpen: () => void;
  emitMessage: (data: unknown) => void;
  emitClose: () => void;
  emitError: (error?: unknown) => void;
};

function mockWebSocket() {
  let instance!: MockWsInstance;

  class MockWebSocket {
    static OPEN = 1;
    readyState = MockWebSocket.OPEN;

    send = vi.fn();
    close = vi.fn();

    private listeners: Record<string, Array<(ev: Event | MessageEvent) => void>> = {};

    constructor() {
      instance = {
        send: this.send,
        close: this.close,

        emitOpen: () => {
          if (this.listeners.open) {
            for (const cb of this.listeners.open) {
              cb(new Event('open'));
            }
          }
        },

        emitMessage: (data: unknown) => {
          if (this.listeners.message) {
            for (const cb of this.listeners.message) {
              cb(
                new MessageEvent('message', {
                  data: JSON.stringify(data),
                }),
              );
            }
          }
        },

        emitClose: () => {
          this.readyState = 3; // CLOSED
          if (this.listeners.close) {
            for (const cb of this.listeners.close) {
              cb(new CloseEvent('close'));
            }
          }
        },

        emitError: (error?: unknown) => {
          if (this.listeners.error) {
            for (const cb of this.listeners.error) {
              cb(new ErrorEvent('error', {error}));
            }
          }
        },
      };
    }

    addEventListener(type: string, cb: (ev: Event | MessageEvent) => void) {
      this.listeners[type] ??= [];
      this.listeners[type].push(cb);
    }

    removeEventListener(type: string, cb: (ev: Event | MessageEvent) => void) {
      this.listeners[type] = (this.listeners[type] ?? []).filter(listener => listener !== cb);
    }
  }

  globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;

  return () => instance;
}
