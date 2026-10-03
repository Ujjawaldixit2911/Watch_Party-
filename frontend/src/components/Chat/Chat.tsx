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
    <div className="flex flex-col h-full bg-[#0F1322]/90 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-700/50 bg-slate-900/70">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading">
            Live Chat
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/40">
          {messages.length} msgs
        </span>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400 mb-2 border border-slate-700/50">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-xs text-slate-300 font-semibold">No messages yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Start the conversation with your party!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === currentUserId;

            if (msg.isSystem) {
              return (
                <div
                  key={msg.id}
                  className="flex items-center gap-2 py-1 px-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono"
                >
                  <Bot className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>{msg.content}</span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* User Avatar Initial */}
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm mt-0.5">
                  {msg.username.charAt(0).toUpperCase()}
                </div>

                {/* Message Content & Info */}
                <div className={`flex flex-col space-y-1 max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 px-0.5">
                    <span className="text-[11px] font-semibold text-slate-200">
                      {isMe ? 'You' : msg.username}
                    </span>
                    <RoleBadge role={msg.role} className="scale-[0.8] origin-left" />
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div
                    className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed break-words ${
                      isMe
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-sm shadow-md shadow-purple-600/20'
                        : 'bg-[#171A2E] text-slate-100 rounded-tl-sm border border-slate-700/60 shadow-inner'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800/80 bg-slate-900/60">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Say something..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            maxLength={500}
            className="flex-1 bg-[#090A14] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-colors"
          />
          <Button
            type="submit"
            variant="primary"
            size="icon"
            disabled={!inputMessage.trim()}
            className="h-8 w-8 rounded-xl flex-shrink-0 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-md shadow-cyan-500/20"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5 fill-slate-950" />
          </Button>
        </div>
      </form>
    </div>
  );
};
