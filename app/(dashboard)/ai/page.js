'use client';

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { getFirebaseIdToken } from '@/lib/firebaseAuth';

let socket;

export default function ChatPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    socket = io('http://localhost:5000');
    socket.on('connect', () => console.log('Socket connected'));

    const fetchConversations = async () => {
      const token = await getFirebaseIdToken();
      const res = await fetch('http://localhost:5000/api/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data);
      if (data.length > 0) {
        joinConversation(data[0]._id);
      }
    };

    fetchConversations();

    socket.on('chat-history', setMessages);
    socket.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('ai-typing', setTyping);

    return () => socket.disconnect();
  }, [user]);

  const joinConversation = (id) => {
    setConversationId(id);
    socket.emit('join-chat', {
      userId: user.uid,
      conversationId: id,
    });
  };

  const sendMessage = async () => {
    if (!message.trim() || !conversationId) return;

    socket.emit('send-message', {
      userId: user.uid,
      message,
      conversationId,
    });

    setMessage('');
  };

  const startNewConversation = async () => {
    const token = await getFirebaseIdToken();
    const res = await fetch('http://localhost:5000/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: 'New Chat ' + Date.now() }),
    });
    const convo = await res.json();
    setConversations((prev) => [convo, ...prev]);
    joinConversation(convo._id);
    setMessages([]);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r p-4 overflow-y-auto">
        <Button onClick={startNewConversation} className="w-full mb-4">
          + New Chat
        </Button>
        {conversations.map((c) => (
          <div
            key={c._id}
            onClick={() => joinConversation(c._id)}
            className={`p-2 cursor-pointer hover:bg-blue-100 ${
              conversationId === c._id ? 'bg-blue-200 font-bold' : ''
            }`}
          >
            {c.title}
          </div>
        ))}
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col p-6">
        <ScrollArea className="flex-1 space-y-3 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-md max-w-xl ${
                msg.sender === 'user'
                  ? 'bg-blue-100 self-end text-right'
                  : 'bg-gray-200 self-start text-left'
              }`}
            >
              <div>{msg.message}</div>
            </div>
          ))}
          {typing && <div className="italic text-sm text-gray-400">AI is typing...</div>}
          <div ref={scrollRef} />
        </ScrollArea>

        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Ask something..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}
