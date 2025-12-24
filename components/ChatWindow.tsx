import React, { useEffect, useRef } from "react";

interface Message {
  type: "text" | "code" | "image";
  content: string;
}

interface Props {
  messages: Message[];
}

export default function ChatWindow({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ height: "500px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
      {messages.map((msg, idx) => {
        if (msg.type === "code") {
          return (
            <pre key={idx} style={{ background: "#f5f5f5", padding: "5px" }}>
              {msg.content}
            </pre>
          );
        }
        if (msg.type === "image") {
          return <img key={idx} src={msg.content} alt="AI output" style={{ maxWidth: "100%" }} />;
        }
        return <p key={idx}>{msg.content}</p>;
      })}
      <div ref={bottomRef} />
    </div>
  );
}
