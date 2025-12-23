import {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  type Participant,
  type ClientMessage,
  type VotingSystem,
  serverMessageSchema,
  clientMessageSchema,
} from '@planning-poker/shared';

type UseGameReturn = {
  participants: Participant[];
  revealed: boolean;
  myVote: string | undefined;
  votingSystem: VotingSystem | undefined;
  vote: (value: string | undefined) => void;
  reveal: () => void;
  reset: () => void;
  disconnect: () => void;
  notFound: boolean;
  roomFull: boolean;
};

const BACKEND_URL: string = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8787';

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
  const [myVote, setMyVote] = useState<string | undefined>(undefined);
  const [revealed, setRevealed] = useState(false);
  const [votingSystem, setVotingSystem] = useState<VotingSystem | undefined>(undefined);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [roomFull, setRoomFull] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | undefined>(undefined);

  const send = useCallback((message: ClientMessage) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const result = clientMessageSchema.safeParse(message);
    if (!result.success) {
      console.error('Invalid client message:', result.error);
      return;
    }

    ws.send(JSON.stringify(result.data));
  }, []);

  const handleMessage = (event: MessageEvent) => {
    const rawData = JSON.parse(event.data);

    const result = serverMessageSchema.safeParse(rawData);
    if (!result.success) {
      console.error('Invalid server message:', result.error);
      return;
    }

    const {data} = result;

    switch (data.type) {
      case 'joined': {
        setVotingSystem(data.votingSystem);
        setParticipants(data.participants);
        setRevealed(data.revealed);
        break;
      }

      case 'update': {
        setParticipants(data.participants);
        setRevealed(data.revealed);
        break;
      }

      case 'reset': {
        setParticipants(data.participants);
        setRevealed(false);
        setMyVote(undefined);
        break;
      }

      case 'not-found': {
        setNotFound(true);
        break;
      }

      case 'room-full': {
        setRoomFull(true);
        break;
      }

      default: {
        // Exhaustiveness check
        const _exhaustiveCheck: never = data;
        console.warn('Unknown message type:', _exhaustiveCheck);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;

    const checkExists = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/games/${gameId}/exists`);

        if (!response.ok) {
          if (!cancelled) {
            setNotFound(true);
          }

          return;
        }

        const {exists} = await response.json();

        if (!exists && !cancelled) {
          setNotFound(true);
        }
      } catch {
        if (!cancelled) {
          setNotFound(true);
        }
      }
    };

    void checkExists();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  useEffect(() => {
    const wsBase = toWebSocketUrl(BACKEND_URL);
    const wsUrl = `${wsBase}/game/${gameId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.addEventListener('open', () => {
      send({type: 'join', name});
    });

    ws.addEventListener('message', handleMessage);

    return () => {
      ws.close();
    };
  }, [gameId, name, send]);

  const vote = useCallback((value: string | undefined) => {
    send({type: 'vote', vote: value});
    setMyVote(value);
  }, [send]);

  const reveal = useCallback(() => {
    send({type: 'reveal'});
  }, [send]);

  const reset = useCallback(() => {
    send({type: 'reset'});
    setMyVote(undefined);
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
    notFound,
    roomFull,
  };
}
