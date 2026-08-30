import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Hand, Mic, Bot } from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';
import { useAuth } from '../context/AuthContext';

const MeetingChat = () => {
  const { messages, sendChatMessage } = useMeeting();
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendChatMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FBF8F3] border border-[#EADCC8] rounded-2xl shadow-warm overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-[#EADCC8] bg-[#F7F1E8] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#5A3E2B]">
          <MessageSquare className="w-4 h-4 text-[#A67C52]" />
          <h3 className="font-semibold text-sm">Meeting Chat</h3>
        </div>
        <span className="text-xs text-[#7D7167]">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => {
          const isMe = msg.sender === user?._id || msg.senderName === 'You' || msg.senderName === user?.name;
          const isSign = msg.type === 'sign';
          const isSystem = msg.type === 'system';

          if (isSystem) {
            return (
              <div key={msg._id || index} className="text-center my-2">
                <span className="text-[11px] bg-[#EADCC8] text-[#5A3E2B] px-3 py-1 rounded-full inline-block font-medium">
                  {msg.message}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg._id || index}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-xs text-[#7D7167]">
                <span className="font-semibold text-[#5A3E2B]">
                  {msg.senderName} {isMe && '(You)'}
                </span>
                {isSign && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold border border-amber-200">
                    <Hand className="w-2.5 h-2.5" /> Sign
                  </span>
                )}
                <span className="text-[10px]">
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  isSign
                    ? 'bg-[#EADCC8] border border-[#DCC8AE] text-[#2F261F]'
                    : isMe
                    ? 'bg-[#5A3E2B] text-[#FBF8F3] shadow-warm-sm'
                    : 'bg-[#F7F1E8] border border-[#EADCC8] text-[#2F261F]'
                }`}
              >
                {isSign ? (
                  <div>
                    <span className="font-bold text-[#5A3E2B] block text-xs mb-0.5">
                      🤟 [{msg.sign}]
                    </span>
                    <p>"{msg.text || msg.message}"</p>
                  </div>
                ) : (
                  <p>{msg.message}</p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#F7F1E8] border-t border-[#EADCC8] flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type an accessible message..."
          aria-label="Chat message"
          className="flex-1 bg-white border border-[#DCC8AE] rounded-xl px-3.5 py-2 text-sm text-[#2F261F] placeholder-[#7D7167] focus:outline-none focus:border-[#5A3E2B]"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="bg-[#5A3E2B] hover:bg-[#422D1F] text-[#FBF8F3] p-2.5 rounded-xl disabled:opacity-40 transition shadow-warm-sm"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default MeetingChat;
