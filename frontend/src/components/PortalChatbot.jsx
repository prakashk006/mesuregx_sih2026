import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Award,
  HelpCircle,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { queryKnowledgeBase } from '../services/chatbotKnowledgeBase';

export default function PortalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Namaste! 🙏 I am MesureBot, your official MESUREGX Portal Guide. How can I assist you with Legal Metrology services today?',
      chips: [
        '📝 How do I apply for verification?',
        '🔍 How to verify a scale QR code?',
        '📱 How does mobile field inspection work?',
        '🔐 What is physical lead sealing?',
        '🎯 What is MESUREGX?',
      ],
      links: [
        { label: 'Apply for Verification', url: '/business/applications/new' },
        { label: 'Public QR Verification', url: '/verify' },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend = null) => {
    const queryText = (textToSend || input).trim();
    if (!queryText) return;

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate natural AI thinking delay
    setTimeout(() => {
      const response = queryKnowledgeBase(queryText);
      let botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (response.type === 'GUIDE') {
        botMsg.title = response.title;
        botMsg.steps = response.steps;
        botMsg.links = response.links;
      } else if (response.type === 'FAQ' || response.type === 'CUSTOM') {
        botMsg.title = response.title;
        botMsg.text = response.answer;
        botMsg.links = response.links;
      } else if (response.type === 'SERVICES_LIST') {
        botMsg.title = response.title;
        botMsg.services = response.services;
      } else {
        botMsg.title = response.title;
        botMsg.text = response.answer;
        botMsg.chips = response.suggestedChips;
      }

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 380);
  };

  const handleLinkClick = (url) => {
    if (url.startsWith('/#')) {
      const id = url.replace('/#', '');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(url);
    }
    // On small screens, close the chat modal when navigating
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: 'Chat history cleared. How can I help you navigate the MESUREGX Portal?',
        chips: [
          '📝 How do I apply for verification?',
          '🔍 How to verify a scale QR code?',
          '📱 How does mobile field inspection work?',
          '🎯 What is MESUREGX?',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* 1. Floating Launcher Button (Always visible on bottom right) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.85rem 1.35rem',
            backgroundColor: '#064E3B',
            color: '#FFFFFF',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '999px',
            boxShadow: '0 8px 24px rgba(6, 78, 59, 0.45), 0 2px 6px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: 'inherit',
          }}
          className="hover:scale-105 active:scale-95"
          aria-label="Open MESUREGX Assistant"
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <MessageSquare size={20} color="#10B981" />
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                width: 8,
                height: 8,
                backgroundColor: '#10B981',
                borderRadius: '50%',
                border: '1.5px solid #064E3B',
              }}
            />
          </div>
          <div style={{ textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.01em', lineHeight: 1.2 }}>
              Ask MesureBot
            </span>
            <span style={{ display: 'block', fontSize: '0.68rem', color: '#A7F3D0', fontWeight: 500 }}>
              Official Portal Guide
            </span>
          </div>
        </button>
      )}

      {/* 2. Expanded Interactive Chatbot Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '92vw',
            maxWidth: '430px',
            height: '620px',
            maxHeight: '85vh',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            animation: 'fadeInUp 0.3s ease-out',
            fontFamily: 'inherit',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Sparkles size={20} color="#10B981" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>MesureBot Guide</span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(16, 185, 129, 0.25)',
                      color: '#A7F3D0',
                      fontWeight: 700,
                    }}
                  >
                    AI GUIDE
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#D1FAE5' }}>
                  Legal Metrology Portal Assistant • 24/7
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={handleClearChat}
                title="Restart Conversation"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                }}
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Conversation Stream */}
          <div
            style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: '86%',
                    padding: '0.85rem 1.1rem',
                    borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    backgroundColor: m.sender === 'user' ? '#064E3B' : '#FFFFFF',
                    color: m.sender === 'user' ? '#FFFFFF' : '#1E293B',
                    boxShadow: m.sender === 'user' ? '0 2px 8px rgba(6, 78, 59, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
                    border: m.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                  }}
                >
                  {m.title && (
                    <div
                      style={{
                        fontWeight: 800,
                        color: m.sender === 'user' ? '#A7F3D0' : '#064E3B',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <BookOpen size={16} /> {m.title}
                    </div>
                  )}

                  {m.text && <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>}

                  {/* Step by step numbered list */}
                  {m.steps && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.35rem' }}>
                      {m.steps.map((st, i) => (
                        <div key={i} style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.45 }}>
                          {st}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Services List Preview */}
                  {m.services && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
                      {m.services.map((s) => (
                        <div
                          key={s.id}
                          style={{
                            padding: '0.65rem',
                            backgroundColor: '#F1F5F9',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                          }}
                        >
                          <div style={{ fontWeight: 700, color: '#064E3B', fontSize: '0.82rem' }}>{s.title}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: 2 }}>{s.description}</div>
                          {s.link && (
                            <button
                              type="button"
                              onClick={() => handleLinkClick(s.link)}
                              style={{
                                marginTop: '0.4rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: '#047857',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                              }}
                            >
                              {s.actionText || 'Go to Page'} <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Deep-link Action Buttons */}
                  {m.links && m.links.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                      {m.links.map((lnk, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleLinkClick(lnk.url)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            backgroundColor: '#ECFDF5',
                            color: '#065F46',
                            border: '1px solid #10B981',
                            borderRadius: '999px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {lnk.label} <ExternalLink size={11} />
                        </button>
                      ))}
                    </div>
                  )}

                  <span
                    style={{
                      display: 'block',
                      textAlign: 'right',
                      fontSize: '0.65rem',
                      color: m.sender === 'user' ? '#A7F3D0' : '#94A3B8',
                      marginTop: '0.35rem',
                    }}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {/* Suggested Chips below bot messages */}
                {m.chips && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      marginTop: '0.6rem',
                      maxWidth: '96%',
                    }}
                  >
                    {m.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(chip)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          backgroundColor: '#FFFFFF',
                          color: '#0F766E',
                          border: '1px solid #99F6E4',
                          borderRadius: '999px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          transition: 'all 0.15s ease',
                          textAlign: 'left',
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.75rem', color: '#64748B', fontSize: '0.78rem' }}>
                <Sparkles size={14} className="animate-spin" color="#10B981" />
                <span>MesureBot is finding statutory information...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '0.85rem 1.1rem',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about applying, QR verify, fees, rules..."
              style={{
                flex: 1,
                padding: '0.65rem 0.95rem',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                fontSize: '0.85rem',
                outline: 'none',
                color: '#1E293B',
                backgroundColor: '#F8FAFC',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                backgroundColor: input.trim() ? '#064E3B' : '#E2E8F0',
                color: input.trim() ? '#FFFFFF' : '#94A3B8',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
