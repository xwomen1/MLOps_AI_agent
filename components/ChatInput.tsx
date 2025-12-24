import React, { useState } from "react";

interface Props {
  onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: Props) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div style={{ marginTop: "10px", display: "flex" }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ flex: 1, padding: "8px" }}
        placeholder="Type a message..."
      />
      <button onClick={handleSend} style={{ marginLeft: "5px", padding: "8px 12px" }}>
        Send
      </button>
    </div>
  );
}
