import { useRef, useEffect, useState, type KeyboardEvent } from "react";
import "./App.css";
import { useSocket } from "./hooks/useSocket";

function App() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  type Message = {
    id: string;
    text: string;
    self?: boolean;
    meta?: string | undefined;
  };
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const { send, socketRef } = useSocket(
    "ws://localhost:8080",
    (e: MessageEvent) => {
      // try to parse incoming JSON messages and extract a friendly text
      let text = String(e.data);
      let meta: string | undefined = undefined;
      try {
        const parsed = JSON.parse(e.data);
        meta = parsed;
        if (parsed?.type === "chat" && parsed?.payload?.message) {
          text = parsed.payload.message;
        } else if (parsed?.type === "join") {
          text = `user joined room ${parsed.payload?.room ?? ""}`;
        } else {
          text = JSON.stringify(parsed);
        }
      } catch {
        // keep raw text
      }

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()) + Math.random().toString(36).slice(2),
          text,
          self: false,
          meta,
        },
      ]);
    }
  );

  const joinedRef = useRef(false);

  useEffect(() => {
    const ws = socketRef.current;
    if (!ws) return;

    const handleOpen = () => {
      if (joinedRef.current) return;
      const joinPayload = {
        type: "join",
        payload: { room: "123" },
      };
      send(JSON.stringify(joinPayload));
      joinedRef.current = true;
    };

    ws.addEventListener("open", handleOpen);
    if (ws.readyState === WebSocket.OPEN) handleOpen();

    return () => {
      ws.removeEventListener("open", handleOpen);
    };
  }, [socketRef, send]);

  useEffect(() => {
    // auto-scroll to bottom when messages update
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const message = inputRef.current?.value ?? "";
    const chatPayload = {
      type: "chat",
      payload: { message },
    };
    send(JSON.stringify(chatPayload));
    // append locally as a sent message for instant UI feedback
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()) + Math.random().toString(36).slice(2),
        text: message,
        self: true,
      },
    ]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // send on Enter (but allow Shift+Enter for newline if you want)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="h-screen bg-black p-2">
      <div
        ref={messagesRef}
        className="h-[90vh] border border-gray-100 m-2 overflow-y-auto p-2"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-2 flex ${m.self ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-3 py-2 text-sm wrap-break-words ${
                m.self
                  ? "bg-blue-500 text-white rounded-tl-lg rounded-bl-lg rounded-br-lg"
                  : "bg-gray-800 text-white rounded-tr-lg rounded-tl-lg rounded-br-lg"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="h-[5vh] border flex items-center justify-center">
        <input
          ref={inputRef}
          type="text"
          name="text"
          id="text"
          onKeyDown={handleKeyDown}
          className=" rounded px-2 py-1 text-white bg-gray-700 w-3/4 "
        />
        <button
          type="submit"
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded "
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
