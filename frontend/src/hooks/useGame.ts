import {
  useState, useEffect, useRef, useCallback,
} from 'react';

type Participant = {
  id: string;
  name: string;
  vote: string | undefined;
};

type UseGameReturn = {
  participants: Participant[];
  revealed: boolean;
  myVote: string | undefined;
  votingSystem: string | undefined;
  vote: (value: string | undefined) => void;
  reveal: () => void;
  reset: () => void;
  disconnect: () => void;
  notFound: boolean;
};

type ClientMessage =
  | {type: 'join'; name: string}
  | {type: 'vote'; vote: string | undefined}
  | {type: 'reveal'}
  | {type: 'reset'};

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
  const [myVote, setMyVote] = useState<string | undefined>(undefined);
  const [revealed, setRevealed] = useState(false);
  const [votingSystem, setVotingSystem] = useState<string | undefined>(undefined);
  const [notFound, setNotFound] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | undefined>(undefined);

  const send = useCallback((message: ClientMessage) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    ws.send(JSON.stringify(message));
  }, []);

  const handleMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case 'joined': {
        setVotingSystem(data.votingSystem);
        setParticipants(data.participants);
        setRevealed(data.revealed);
        break;
      }

      case 'participantJoined':
      case 'voteUpdated':
      case 'votesRevealed':
      case 'participantLeft': {
        setParticipants(data.participants);
        setRevealed(data.revealed);
        break;
      }

      case 'votesReset': {
        setParticipants(data.participants);
        setRevealed(data.revealed);
        setMyVote(undefined);
        break;
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

    checkExists();

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
  };
}
