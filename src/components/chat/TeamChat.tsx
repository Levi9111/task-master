import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../app/hooks.useAuth';
import { chatService } from '../../services/chat.service';
import type { ChatMessage } from '../../services/chat.service';
import { Send, Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TeamChatProps {
  teamId: string;
  teamName: string;
  onBack: () => void;
  members: any[];
  onPresenceUpdate: (onlineUserIds: string[]) => void;
}

export default function TeamChat({
  teamId,
  teamName,
  onBack,
  members,
  onPresenceUpdate,
}: TeamChatProps) {
  const { user, accessToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<{ [userId: string]: string }>({});
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any | null>(null);
  const isTypingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load message history
  useEffect(() => {
    setLoading(true);
    chatService.getHistory(teamId)
      .then((res) => {
        setMessages(res.data);
        setLoading(false);
        setTimeout(scrollToBottom, 50);
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err);
        setLoading(false);
      });
  }, [teamId]);

  // Socket.io Connection & Events
  useEffect(() => {
    if (!accessToken) return;

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const socket = io(`${serverUrl}/chat`, {
      auth: {
        token: accessToken,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Join the team room
      socket.emit('join-team', teamId);
    });

    // Listen for new messages
    socket.on('new-chat-message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(scrollToBottom, 50);
    });

    // Listen for presence changes
    socket.on('presence-update', (userIds: string[]) => {
      setOnlineUserIds(userIds);
      onPresenceUpdate(userIds);
    });

    // Listen for typing events
    socket.on('user-typing', (data: { userId: string; email: string; isTyping: boolean }) => {
      if (data.userId === user?._id) return;

      setTypingUsers((prev) => {
        const updated = { ...prev };
        if (data.isTyping) {
          // Find matching member name
          const memberObj = members.find(
            (m) => (typeof m.userId === 'object' ? m.userId?._id : m.userId) === data.userId
          );
          updated[data.userId] = memberObj?.userId?.name || data.email;
        } else {
          delete updated[data.userId];
        }
        return updated;
      });
    });

    return () => {
      socket.emit('leave-team', teamId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [teamId, accessToken, user?._id, members, onPresenceUpdate]);

  // Handle typing input updates
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!socketRef.current) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketRef.current.emit('typing', { teamId, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socketRef.current?.emit('typing', { teamId, isTyping: false });
    }, 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current) return;

    // Send via socket
    socketRef.current.emit('send-chat-message', {
      teamId,
      content: inputText.trim(),
    });

    // Clear local input & stop typing trigger
    setInputText('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    socketRef.current.emit('typing', { teamId, isTyping: false });
  };

  const typingText = Object.values(typingUsers).join(', ');

  return (
    <div
      className="flex flex-col h-[650px] rounded-3xl overflow-hidden relative"
      style={{
        background: '#0d0d18',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
      }}
    >
      {/* ── Chat Header ── */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#606080] hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#ededff] text-base">{teamName} Workspace</span>
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  background: socketRef.current?.connected ? '#10b981' : '#f59e0b',
                  boxShadow: socketRef.current?.connected ? '0 0 8px #10b981' : '0 0 8px #f59e0b',
                }}
              />
            </div>
            <p className="text-[11px] text-[#606080] mt-0.5">
              {onlineUserIds.length} of {members.length} online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#606080]">
          <MessageSquare size={13} /> Real-time Chat
        </div>
      </div>

      {/* ── Message Log ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="text-[#7c6fff] animate-spin" size={24} />
            <span className="text-xs text-[#606080]">Fetching team messages…</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-xs mx-auto space-y-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,111,255,0.08)', border: '1px solid rgba(124,111,255,0.15)' }}>
              <MessageSquare size={20} className="text-[#7c6fff]" />
            </div>
            <h4 className="font-bold text-[#ededff] text-sm">Welcome to {teamName} Chat</h4>
            <p className="text-xs text-[#606080]">This is the beginning of your team workspace. Send a message to start collaborating!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId?._id === user?._id;
            const senderName = msg.senderId?.name || 'Teammate';
            const senderInitials = senderName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

            return (
              <div key={msg._id} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                  style={{
                    background: isMe
                      ? 'linear-gradient(135deg, #7c6fff, #5b54d4)'
                      : 'linear-gradient(135deg, #2dd4bf, #059669)',
                  }}
                >
                  {senderInitials}
                </div>

                {/* Bubble Container */}
                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name */}
                  {!isMe && (
                    <span className="text-[10px] font-semibold text-[#606080] mb-1 ml-1">
                      {senderName}
                    </span>
                  )}

                  {/* Bubble */}
                  <div
                    className="p-3.5 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: isMe ? '#7c6fff' : 'rgba(255,255,255,0.03)',
                      color: isMe ? '#ffffff' : '#cccce0',
                      border: isMe ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      boxShadow: isMe ? '0 4px 16px rgba(124,111,255,0.2)' : 'none',
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[9px] text-[#44445a] mt-1 px-1">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Typing & Action Bar ── */}
      <div className="px-6 py-4" style={{ background: 'rgba(255,255,255,0.005)' }}>
        {/* Typing indicator */}
        <div className="h-5 mb-1.5 ml-1">
          {typingText && (
            <span className="text-[11px] text-[#2dd4bf] flex items-center gap-1.5 font-medium animate-pulse">
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              {typingText} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
            </span>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={`Message #${teamName.toLowerCase()}...`}
            className="flex-1 px-4 py-3 rounded-xl text-sm text-[#ededff] placeholder-[#44445a] outline-none transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(124,111,255,0.3)';
              e.target.style.background = 'rgba(255,255,255,0.05)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.07)';
              e.target.style.background = 'rgba(255,255,255,0.03)';
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #7c6fff 0%, #5b54d4 100%)',
              boxShadow: inputText.trim() ? '0 4px 16px rgba(124,111,255,0.3)' : 'none',
            }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
