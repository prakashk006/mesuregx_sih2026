import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Send,
  Sparkles,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import ToyBotAvatar from './ToyBotAvatar';
import { queryKnowledgeBase } from '../services/chatbotKnowledgeBase';

/**
 * Web Audio API Subtle Chime Synthesizer
 * Provides soft pleasant auditory feedback with 0 external audio files
 */
function playSoftChime(type = 'receive') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.06); // A5
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.16);
    }
  } catch (e) {
    // Audio contexts might be blocked before first user gesture
  }
}

export default function PortalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [botExpression, setBotExpression] = useState('idle'); // 'idle' | 'thinking' | 'happy'
  const [copiedId, setCopiedId] = useState(null);
  const [speechBubbleVisible, setSpeechBubbleVisible] = useState(true);

  const initialWelcome = {
    id: 'welcome',
    sender: 'bot',
    badge: '👋 Assistant Welcome',
    title: 'Namaste! I am Mesuri, your Metrology AI Guide',
    text: 'I am here to guide you through the MESUREGX Portal and the Legal Metrology verification lifecycle. What would you like to know?',
    bullets: [
      '⚖️ Learn what a Legal Metrology Officer (Inspector) does on-site.',
      '📝 Understand how traders apply for instrument verification.',
      '💰 Check statutory fee schedules and Treasury Challan rules.',
      '🔍 Learn how consumers verify scale accuracy via QR stickers.',
    ],
    chips: [
      '⚖️ Who is the Legal Metrology Officer?',
      '📝 How do I apply for scale verification?',
      '💰 How are verification fees calculated?',
      '🔍 How to verify a scale QR code?',
      '🔒 What is physical lead sealing?',
      '🎯 What is MESUREGX?',
    ],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState([initialWelcome]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = (textToSend = null) => {
    const queryText = (textToSend || input).trim();
    if (!queryText) return;

    if (soundEnabled) playSoftChime('send');

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
    setBotExpression('thinking');

    // Simulate natural AI thinking delay
    setTimeout(() => {
      const response = queryKnowledgeBase(queryText);

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        badge: response.badge,
        title: response.title,
        text: response.answer,
        bullets: response.bullets,
        links: response.links,
        chips: response.suggestedChips,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      setBotExpression('happy');

      if (soundEnabled) playSoftChime('receive');

      // Return to idle after a pleasant moment
      setTimeout(() => {
        setBotExpression('idle');
      }, 2500);
    }, 450);
  };

  const handleLinkClick = (url) => {
    if (url.startsWith('/#')) {
      const id = url.replace('/#', '');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(url);
    }
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        badge: '🔄 History Reset',
        title: 'Chat History Cleared',
        text: 'How can I assist you with Legal Metrology services or navigating the portal?',
        chips: [
          '⚖️ Who is the Legal Metrology Officer?',
          '📝 How do I apply for verification?',
          '💰 How are fees calculated?',
          '🎯 What is MESUREGX?',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleCopyText = (msgId, text, bullets = []) => {
    const fullText = `${text}\n\n${bullets ? bullets.join('\n') : ''}`.trim();
    navigator.clipboard.writeText(fullText);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* 1. FLOATING TOY BOT LAUNCHER (Always active on bottom right when closed) */}
      {!isOpen && (
        <div className="portal-chatbot-launcher">
          <ToyBotAvatar
            size={64}
            expression="idle"
            isFloating={true}
            showSpeechBubble={speechBubbleVisible}
            bubbleText="👋 Ask Mesuri AI!"
            onBubbleClick={() => setIsOpen(true)}
            onClick={() => {
              setIsOpen(true);
              setSpeechBubbleVisible(false);
            }}
          />
        </div>
      )}

      {/* 2. EXPANDED INTERACTIVE CHAT WINDOW */}
      {isOpen && (
        <div className="portal-chatbot-modal">
          {/* Top Header with Interactive Toy Bot Mascot */}
          <div
            style={{
              padding: '0.85rem 1.15rem',
              background: 'linear-gradient(135deg, #064E3B 0%, #0F766E 100%)',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Mascot Head inside Header */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                <ToyBotAvatar size={40} expression={botExpression} isFloating={false} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.98rem', letterSpacing: '0.01em' }}>
                    Mesuri
                  </span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      backgroundColor: '#10B981',
                      color: '#064E3B',
                      padding: '0.12rem 0.4rem',
                      borderRadius: '4px',
                    }}
                  >
                    AI BOT
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '1px' }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      backgroundColor: isTyping ? '#38BDF8' : '#34D399',
                      display: 'inline-block',
                      boxShadow: '0 0 6px #34D399',
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#D1FAE5', fontWeight: 500 }}>
                    {isTyping ? 'Thinking & Explaining...' : 'Online & Ready'}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: soundEnabled ? '#6EE7B7' : '#9CA3AF',
                  padding: '6px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                type="button"
                onClick={handleClearChat}
                title="Reset Chat"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#D1FAE5',
                  padding: '6px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RotateCcw size={16} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize Chat"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '6px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {messages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBot ? 'flex-start' : 'flex-end',
                    maxWidth: '100%',
                  }}
                >
                  {/* Sender Badge */}
                  <div
                    style={{
                      fontSize: '0.66rem',
                      color: '#64748B',
                      marginBottom: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0 4px',
                    }}
                  >
                    <span>{isBot ? '🤖 Mesuri AI' : '👤 You'}</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </div>

                  {/* Message Bubble Card */}
                  <div
                    style={{
                      maxWidth: '92%',
                      backgroundColor: isBot ? '#FFFFFF' : '#064E3B',
                      color: isBot ? '#1E293B' : '#FFFFFF',
                      padding: '0.85rem 1rem',
                      borderRadius: '16px',
                      borderTopLeftRadius: isBot ? '4px' : '16px',
                      borderTopRightRadius: isBot ? '16px' : '4px',
                      boxShadow: isBot
                        ? '0 2px 8px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(15, 23, 42, 0.05)'
                        : '0 4px 12px rgba(6, 78, 59, 0.25)',
                      lineHeight: 1.5,
                      fontSize: '0.85rem',
                      position: 'relative',
                    }}
                  >
                    {/* Bot Topic Badge */}
                    {isBot && m.badge && (
                      <div
                        style={{
                          display: 'inline-block',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: '#047857',
                          backgroundColor: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          marginBottom: '0.5rem',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {m.badge}
                      </div>
                    )}

                    {/* Bot Topic Title */}
                    {isBot && m.title && (
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          color: '#064E3B',
                          marginBottom: '0.45rem',
                          lineHeight: 1.3,
                        }}
                      >
                        {m.title}
                      </div>
                    )}

                    {/* Main Text Content */}
                    {m.text && (
                      <div style={{ whiteSpace: 'pre-line', marginBottom: m.bullets ? '0.6rem' : '0' }}>
                        {m.text}
                      </div>
                    )}

                    {/* Bullet Explanations */}
                    {m.bullets && m.bullets.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.45rem',
                          marginTop: '0.5rem',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid #F1F5F9',
                        }}
                      >
                        {m.bullets.map((b, bIdx) => (
                          <div
                            key={bIdx}
                            style={{
                              fontSize: '0.81rem',
                              color: '#334155',
                              lineHeight: 1.45,
                              backgroundColor: '#F8FAFC',
                              padding: '0.4rem 0.6rem',
                              borderRadius: '8px',
                              borderLeft: '3px solid #10B981',
                            }}
                          >
                            {b}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Links */}
                    {m.links && m.links.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.45rem',
                          marginTop: '0.75rem',
                          paddingTop: '0.55rem',
                          borderTop: '1px solid #F1F5F9',
                        }}
                      >
                        {m.links.map((lnk, lIdx) => (
                          <button
                            key={lIdx}
                            type="button"
                            onClick={() => handleLinkClick(lnk.url)}
                            style={{
                              backgroundColor: '#064E3B',
                              color: '#FFFFFF',
                              border: 'none',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              boxShadow: '0 2px 4px rgba(6, 78, 59, 0.2)',
                            }}
                          >
                            <span>{lnk.label}</span>
                            <ArrowRight size={12} />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Copy Button for Bot Messages */}
                    {isBot && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(m.id, m.text || m.title, m.bullets)}
                        title="Copy Explanation"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'none',
                          border: 'none',
                          color: copiedId === m.id ? '#10B981' : '#94A3B8',
                          padding: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {copiedId === m.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>

                  {/* Suggestion Chips Below Bot Response */}
                  {isBot && m.chips && m.chips.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.4rem',
                        marginTop: '0.65rem',
                        maxWidth: '92%',
                      }}
                    >
                      {m.chips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => handleSend(chip)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            color: '#064E3B',
                            border: '1px solid #CBD5E1',
                            padding: '0.35rem 0.7rem',
                            borderRadius: '999px',
                            fontSize: '0.73rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          }}
                          className="hover:border-emerald-600 hover:bg-emerald-50 active:scale-95"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking / Scanning Loading Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem' }}>
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '0.65rem 0.95rem',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <ToyBotAvatar size={24} expression="thinking" isFloating={false} />
                  <span style={{ fontSize: '0.78rem', color: '#0F766E', fontWeight: 600 }}>
                    Mesuri is formulating an explanation...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about portal, officers, verification..."
              style={{
                flex: 1,
                padding: '0.65rem 0.95rem',
                border: '1.5px solid #CBD5E1',
                borderRadius: '999px',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                color: '#1E293B',
              }}
              className="focus:border-emerald-600"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: input.trim() ? '#064E3B' : '#E2E8F0',
                color: input.trim() ? '#FFFFFF' : '#94A3B8',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Animation & Responsive Styles */}
      <style>{`
        @keyframes toyBotFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }

        .portal-chatbot-launcher {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
        }

        .portal-chatbot-modal {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 92vw;
          maxWidth: 430px;
          height: 620px;
          maxHeight: 86vh;
          background-color: #FFFFFF;
          border-radius: 24px;
          box-shadow: 0 20px 48px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9999;
          animation: toyBotFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: inherit;
        }

        @media (max-width: 640px) {
          .portal-chatbot-launcher {
            bottom: 16px;
            right: 14px;
            transform: scale(0.92);
            transform-origin: bottom right;
          }
          .portal-chatbot-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            max-width: 100vw;
            height: 100%;
            height: 100dvh;
            max-height: 100dvh;
            border-radius: 0;
          }
        }
      `}</style>
    </>
  );
}
