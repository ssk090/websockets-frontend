import { useRef } from "react";
import "./App.css";
import { useSocket } from "./hooks/useSocket";

function App() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { send } = useSocket("ws://localhost:8080", (e: MessageEvent) => {
    alert(e.data);
  });

  function sendMessage() {
    const message = inputRef.current?.value ?? "";
    send(message);
  }

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
