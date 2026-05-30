import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, BookOpen, Loader2 } from 'lucide-react';
import io from 'socket.io-client';
import './ChatModal.css';

const SOCKET_URL = 'http://127.0.0.1:5000';

export default function ChatModal({ token, request, onClose, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!request) return;

    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('receiveMessage', (incomingMessage) => {
      setMessages(prevMessages => {
        if (prevMessages.some(msg => msg._id === incomingMessage._id)) {
          return prevMessages;
        }
        return [...prevMessages, incomingMessage];
      });
    });

    const setupChat = async () => {
      try {
        const convRes = await fetch(`http://127.0.0.1:5000/api/messages/request/${request._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!convRes.ok) throw new Error('Could not fetch conversation.');
        const conversation = await convRes.json();
        
        setConversationId(conversation._id);
        socketRef.current.emit('joinRoom', conversation._id);
        
        const messagesRes = await fetch(`http://127.0.0.1:5000/api/messages/conversation/${conversation._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!messagesRes.ok) throw new Error('Could not fetch messages.');
        const messageHistory = await messagesRes.json();

        setMessages(messageHistory);
        setIsReady(true);
      } catch (error) {
        toast.error(error.message || 'Failed to initialize chat.');
        onClose();
      }
    };
    
    setupChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.off('receiveMessage');
        socketRef.current.disconnect();
      }
    };
  }, [request, token, onClose]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !isReady || !socketRef.current) return;
    
    socketRef.current.emit('sendMessage', {
      conversationId: conversationId, 
      senderId: currentUserId,
      content: newMessage,
    });
    
    setNewMessage('');
  };

  if (!request) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="chat-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="chat-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-overlay)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 'var(--r-xl)',
            boxShadow: '0 0 80px rgba(99,102,241,0.18), 0 24px 64px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(30px)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div className="chat-modal-header" style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 'var(--r-md)',
                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--violet)',
              }}>
                <BookOpen size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                  {request.bookId?.title || 'Book Exchange'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MessageSquare size={11} /> Live Exchange Chat
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)', width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-3)', transition: 'all 0.2s',
              }}
            >
              <X size={16} />
            </motion.button>
          </div>

          {/* Messages Body */}
          <div className="chat-modal-body" style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'rgba(0,0,0,0.1)',
          }}>
            {!isReady ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.75rem' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--violet)' }} />
                <p style={{ fontSize: '0.88rem', color: 'var(--text-3)', margin: 0 }}>Connecting to secure chat...</p>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', opacity: 0.7 }}>
                <MessageSquare size={32} style={{ color: 'var(--text-4)' }} />
                <p style={{ fontSize: '0.88rem', color: 'var(--text-3)', margin: 0 }}>No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = (msg.senderId?._id || msg.senderId) === currentUserId;
                return (
                  <motion.div
                    key={msg._id || idx}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`message-bubble ${isMe ? 'sent' : 'received'}`}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--r-lg)',
                      maxWidth: '75%',
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      background: isMe ? 'var(--grad-brand)' : 'var(--bg-elevated)',
                      border: isMe ? 'none' : '1px solid var(--border)',
                      color: isMe ? '#fff' : 'var(--text-1)',
                      borderBottomRightRadius: isMe ? '4px' : undefined,
                      borderBottomLeftRadius: !isMe ? '4px' : undefined,
                      boxShadow: isMe ? '0 4px 16px rgba(168,85,247,0.15)' : 'none',
                    }}
                  >
                    {!isMe && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--violet)', display: 'block', marginBottom: '0.2rem' }}>
                        {msg.senderId.username}
                      </span>
                    )}
                    <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>{msg.content}</p>
                    <span className="timestamp" style={{
                      fontSize: '0.65rem',
                      display: 'block',
                      textAlign: 'right',
                      marginTop: '0.35rem',
                      opacity: 0.6,
                      color: isMe ? '#fff' : 'var(--text-3)'
                    }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="chat-modal-footer" style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-overlay)',
          }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isReady ? "Type a message..." : "Connecting..."}
                disabled={!isReady}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-1)',
                  borderRadius: 'var(--r-md)',
                  padding: '0.65rem 0.9rem',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
              <motion.button
                whileHover={{ scale: isReady && newMessage.trim() ? 1.04 : 1 }}
                whileTap={{ scale: isReady && newMessage.trim() ? 0.96 : 1 }}
                type="submit"
                disabled={!isReady || !newMessage.trim()}
                className="btn btn-primary"
                style={{
                  padding: '0.65rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  borderRadius: 'var(--r-md)',
                  cursor: (!isReady || !newMessage.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (!isReady || !newMessage.trim()) ? 0.5 : 1,
                }}
              >
                <Send size={15} /> Send
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}