import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const socketRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function sendMessage() {
    const ws = socketRef.current;
    if (!ws) return;

    const message = inputRef.current?.value ?? "";

    ws.send(message);
  }

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    socketRef.current = ws;

    ws.onmessage = (e: MessageEvent) => {
      alert(e.data);
    };

    return () => {
      socketRef.current = null;
    };
  }, []);

  return (
    <>
      <input ref={inputRef} type="text" name="text" id="text" />
      <button type="submit" onClick={sendMessage}>
        Send
      </button>
    </>
  );
}

export default App;
