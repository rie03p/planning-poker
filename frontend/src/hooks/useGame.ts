import {
  useState, useEffect, useCallback, useRef,
} from 'react';
import {
  type Participant,
  type VotingSystem,
  type Issue,
  type ServerMessage,
  registryExistsResponseSchema,
} from '@planning-poker/shared';
import {BACKEND_URL} from '../config/constants';
import type {UseGameReturn} from '../types/game';
import {useWebSocket} from './useWebSocket';

/**
 * Custom hook for managing game state and actions
 * Handles WebSocket communication and game logic
 */
export function useGame(
  gameId: string,
  name: string,
  initialUserId: string,
  onUserIdChange: (userId: string) => void,
): UseGameReturn {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myVote, setMyVote] = useState<string | undefined>(undefined);
  const [revealed, setRevealed] = useState(false);
  const [votingSystem, setVotingSystem] = useState<VotingSystem | undefined>(undefined);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeIssueId, setActiveIssueId] = useState<string | undefined>(undefined);
  const [isSpectator, setIsSpectator] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [roomFull, setRoomFull] = useState<boolean>(false);

  // Track userId across renders for WebSocket communication
  const userIdRef = useRef<string>(initialUserId);

  // Check if game exists
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

        const data = await response.json();
        const result = registryExistsResponseSchema.safeParse(data);

        if (!result.success || (!result.data.exists && !cancelled)) {
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

  // Handle server messages
  const handleMessage = useCallback((data: ServerMessage) => {
    switch (data.type) {
      case 'joined': {
        const previousUserId = userIdRef.current;
        userIdRef.current = data.userId;

        // Only update userId if it actually changed
        if (previousUserId !== data.userId) {
          onUserIdChange(data.userId);
        }

        setVotingSystem(data.votingSystem);
        setParticipants(data.participants);
        setRevealed(data.revealed);
        setIssues(data.issues);
        setActiveIssueId(data.activeIssueId);

        // Sync myVote with the server state based on userId
        const me = data.participants.find(p => p.id === data.userId);
        setMyVote(me?.vote);
        setIsSpectator(me?.isSpectator ?? false);
        break;
      }

      case 'update': {
        setParticipants(data.participants);
        setRevealed(data.revealed);
        if (data.issues) {
          setIssues(data.issues);
        }

        setActiveIssueId(data.activeIssueId);
        // Sync myVote with the server state based on userId
        const me = data.participants.find(p => p.id === userIdRef.current);
        setMyVote(me?.vote);
        setIsSpectator(me?.isSpectator ?? false);
        break;
      }

      case 'issue-added': {
        setIssues(previous => [...previous, data.issue]);
        break;
      }

      case 'issue-removed': {
        setIssues(previous => previous.filter(i => i.id !== data.issueId));
        break;
      }

      case 'issue-updated': {
        setIssues(previous => previous.map(i => (i.id === data.issue.id ? data.issue : i)));
        break;
      }

      case 'reset': {
        setParticipants(data.participants);
        setRevealed(false);
        setMyVote(undefined);
        setIssues(data.issues);
        setActiveIssueId(data.activeIssueId);
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
  }, [onUserIdChange]);

  // WebSocket connection
  const {send, disconnect} = useWebSocket({
    gameId,
    name,
    initialUserId,
    onMessage: handleMessage,
  });

  // Game actions
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

  const addIssue = useCallback((title: string, description?: string, url?: string) => {
    send({
      type: 'add-issue',
      issue: {title, description, url},
    });
  }, [send]);

  const removeIssue = useCallback((issueId: string) => {
    send({type: 'remove-issue', issueId});
  }, [send]);

  const setActiveIssue = useCallback((issueId: string) => {
    send({type: 'set-active-issue', issueId});
  }, [send]);

  const voteNextIssue = useCallback(() => {
    send({type: 'vote-next-issue'});
  }, [send]);

  const updateIssue = useCallback((issue: Issue) => {
    send({
      type: 'update-issue',
      issue,
    });
  }, [send]);

  const removeAllIssues = useCallback(() => {
    send({type: 'remove-all-issues'});
  }, [send]);

  const toggleSpectator = useCallback(() => {
    const nextIsSpectator = !isSpectator;
    const userId = userIdRef.current;
    setIsSpectator(nextIsSpectator);
    setParticipants(current => current.map(p => (p.id === userId
      ? {
        ...p,
        isSpectator: nextIsSpectator,
        vote: nextIsSpectator ? undefined : p.vote,
      }
      : p)));
    if (nextIsSpectator) {
      setMyVote(undefined);
    }
    send({type: 'toggle-spectator'});
  }, [isSpectator, send]);

  return {
    participants,
    revealed,
    myVote,
    votingSystem,
    issues,
    activeIssueId,
    vote,
    reveal,
    reset,
    addIssue,
    removeIssue,
    setActiveIssue,
    voteNextIssue,
    updateIssue,
    removeAllIssues,
    disconnect,
    notFound,
    roomFull,
    toggleSpectator,
    isSpectator,
  };
}
