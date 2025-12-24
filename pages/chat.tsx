"use client"

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { UserButton } from '@clerk/nextjs';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState('http://localhost:8080');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const jwt = await getToken().catch(() => null);
    const assistantMessageId = (Date.now() + 1).toString();
    let buffer = '';

    try {
      const controller = new AbortController();

      await fetchEventSource(`${apiUrl}/api`, {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt && { Authorization: `Bearer ${jwt}` }),
        },
        body: JSON.stringify({
          patient_name: 'Chat User',
          date_of_visit: new Date().toISOString().slice(0, 10),
          notes: input,
        }),
        onmessage(ev) {
          buffer += ev.data;

          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.id === assistantMessageId) {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: buffer },
              ];
            } else {
              return [
                ...prev,
                {
                  id: assistantMessageId,
                  role: 'assistant',
                  content: buffer,
                  timestamp: new Date(),
                },
              ];
            }
          });
        },
        onclose() {
          setLoading(false);
        },
        onerror(err) {
          console.error('SSE error:', err);
          controller.abort();
          setLoading(false);
          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: `❌ Error: Failed to connect to backend at ${apiUrl}.`,
              timestamp: new Date(),
            },
          ]);
        },
      });
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
              <p>Start the conversation by asking about deployments or logs.</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${message.role === 'user' ? 'bg-green-600 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'} max-w-xl px-4 py-2 rounded-lg`}>
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm prose-green dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pt-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about deployments, infra, cloud..."
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded"
          />
          <button type="submit" disabled={loading || !input.trim()} className="px-4 py-2 bg-green-600 text-white rounded">
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
