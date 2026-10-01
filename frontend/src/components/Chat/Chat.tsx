import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot } from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { RoleBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const Chat: React.FC = () => {
  const { state, sendChatMessage } = useRoom();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = state.chatHistory;
  const currentUserId = state.currentUser?.userId;

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed) return;

    sendChatMessage(trimmed);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-[#111113] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-heading">
            Live Chat
          </h3>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800/60 flex items-center justify-center text-zinc-500 mb-2">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-xs text-zinc-400 font-medium">No messages yet.</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Start the conversation with your party!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === currentUserId;

            if (msg.isSystem) {
              return (
                <div
                  key={msg.id}
                  className="flex items-center gap-2 py-1 px-3 bg-zinc-900/60 rounded-xl border border-zinc-800/60 text-[11px] text-zinc-400 font-mono"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>{msg.content}</span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col space-y-1 ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Sender info */}
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-[11px] font-semibold text-zinc-300">
                    {isMe ? 'You' : msg.username}
                  </span>
                  <RoleBadge role={msg.role} className="scale-75 origin-left" />
                  <span className="text-[10px] text-zinc-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Message bubble */}
                <div
                  className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed max-w-[85%] break-words ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                      : 'bg-zinc-800/90 text-zinc-100 rounded-tl-none border border-zinc-700/50'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-zinc-800/80 bg-zinc-900/40">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            maxLength={500}
            className="flex-1 bg-[#09090B] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <Button
            type="submit"
            variant="primary"
            size="icon"
            disabled={!inputMessage.trim()}
            className="h-8 w-8 rounded-xl flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
