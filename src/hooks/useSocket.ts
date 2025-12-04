import { useEffect, useRef, useCallback } from "react";

type MessageHandler = (e: MessageEvent) => void;

export function useSocket(url: string, onMessage?: MessageHandler) {
  const socketRef = useRef<WebSocket | null>(null);
  const handlerRef = useRef<MessageHandler | undefined>(onMessage);

  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onmessage = (e: MessageEvent) => {
      handlerRef.current?.(e);
    };

    return () => {
      try {
        ws.close();
      } catch {
        // ignore
      }
      socketRef.current = null;
    };
  }, [url]);

  const send = useCallback((message: string) => {
    socketRef.current?.send(message);
  }, []);

  return { send, socketRef } as const;
}
