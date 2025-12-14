import { useState, useEffect, useRef, useCallback } from 'react';

interface Participant {
  id: string;
  name: string;
  vote: string | null;
}

interface UseGameReturn {
  participants: Participant[];
  revealed: boolean;
  myVote: string | null;
  votingSystem: string | null;
  vote: (value: string) => void;
  reveal: () => void;
  reset: () => void;
  disconnect: () => void;
}

type ClientMessage =
  | { type: 'join'; name: string }
  | { type: 'vote'; vote: string }
  | { type: 'reveal' }
  | { type: 'reset' }

const BACKEND_URL: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8787';

function toWebSocketUrl(httpUrl: string): string {
  if (httpUrl.startsWith('https://')) {
    return httpUrl.replace(/^https:\/\//, 'wss://');
  }
  if (httpUrl.startsWith('http://')) {
    return httpUrl.replace(/^http:\/\//, 'ws://');
  }
  throw new Error(`Invalid BACKEND_URL: ${httpUrl}`);
}

export function useGame(gameId: string, name: string): UseGameReturn {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [votingSystem, setVotingSystem] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const send = useCallback((message: ClientMessage) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify(message))
  }, [])

  useEffect(() => {
    const wsBase = toWebSocketUrl(BACKEND_URL);
    const wsUrl = `${wsBase}/game/${gameId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      send({ type: 'join', name });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'joined':
          setVotingSystem(data.votingSystem);
          setParticipants(data.participants);
          setRevealed(data.revealed);
          break;
        case 'participantJoined':
        case 'voteUpdated':
        case 'votesRevealed':
        case 'votesReset':
        case 'participantLeft':
          setParticipants(data.participants);
          setRevealed(data.revealed);
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, [gameId, name, send]);

  const vote = useCallback((value: string) => {
    send({ type: 'vote', vote: value });
    setMyVote(value);
  }, [send]);

  const reveal = useCallback(() => {
    send({ type: 'reveal' });
  }, [send]);

  const reset = useCallback(() => {
    send({ type: 'reset' });
    setMyVote(null);
  }, [send]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  return {
    participants,
    revealed,
    myVote,
    votingSystem,
    vote,
    reveal,
    reset,
    disconnect,
  };
}
