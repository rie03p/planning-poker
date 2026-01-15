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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const rawData = JSON.parse(event.data);
        const result = serverMessageSchema.safeParse(rawData);

        if (!result.success) {
          console.error('Invalid server message:', result.error);
          return;
        }

        onMessage(result.data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    const wsBase = toWebSocketUrl(BACKEND_URL);
    const wsUrl = `${wsBase}/game/${gameId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.addEventListener('open', () => {
      send({type: 'join', name, clientId: initialUserId || undefined});
      onOpen?.();
    });

    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', () => {
      onClose?.();
    });
    ws.addEventListener('error', error => {
      onError?.(error);
    });

    return () => {
      ws.close();
    };
  }, [gameId, name, initialUserId, send, onMessage, onOpen, onClose, onError]);

  return {send, disconnect};
}
