import {useRef, useCallback, useEffect} from 'react';
import {
  type ClientMessage,
  type ServerMessage,
  clientMessageSchema,
  serverMessageSchema,
} from '@planning-poker/shared';
import {BACKEND_URL, toWebSocketUrl} from '../config/constants';

type UseWebSocketOptions = {
  gameId: string;
  name: string;
  initialUserId: string;
  onMessage: (message: ServerMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
};

type UseWebSocketReturn = {
  send: (message: ClientMessage) => void;
  disconnect: () => void;
};

/**
 * Custom hook for managing WebSocket connection
 * Handles connection lifecycle, message sending/receiving with validation
 */
export function useWebSocket({
  gameId,
  name,
  initialUserId,
  onMessage,
  onOpen,
  onClose,
  onError,
}: UseWebSocketOptions): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | undefined>(undefined);
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);
  const initialUserIdRef = useRef(initialUserId);
  const nameRef = useRef(name);
  const hasName = Boolean(name);

  // Keep refs up to date
  useEffect(() => {
    onMessageRef.current = onMessage;
    onOpenRef.current = onOpen;
    onCloseRef.current = onClose;
    onErrorRef.current = onError;
    initialUserIdRef.current = initialUserId;
    nameRef.current = name;
  });

  const send = useCallback((message: ClientMessage) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return;
    }

    const result = clientMessageSchema.safeParse(message);
    if (!result.success) {
      console.error('Invalid client message:', result.error);
      return;
    }

    ws.send(JSON.stringify(result.data));
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  const join = useCallback(() => {
    send({type: 'join', name: nameRef.current, clientId: initialUserIdRef.current || undefined});
  }, [send]);

  // Rejoining on the existing connection updates the name without removing the participant.
  useEffect(() => {
    if (name && wsRef.current?.readyState === WebSocket.OPEN) {
      join();
    }
  }, [name, join]);

  useEffect(() => {
    // Don't connect if name is not set
    if (!hasName) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        const rawData = JSON.parse(event.data);
        const result = serverMessageSchema.safeParse(rawData);

        if (!result.success) {
          console.error('Invalid server message:', result.error);
          return;
        }

        onMessageRef.current(result.data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    const wsBase = toWebSocketUrl(BACKEND_URL);
    const wsUrl = `${wsBase}/game/${gameId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.addEventListener('open', () => {
      join();

      onOpenRef.current?.();
    });

    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', () => {
      onCloseRef.current?.();
    });
    ws.addEventListener('error', error => {
      onErrorRef.current?.(error);
    });

    return () => {
      ws.close();
    };
  }, [gameId, hasName, join]);

  return {send, disconnect};
}
