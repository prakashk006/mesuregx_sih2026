import React, { useState, useEffect } from 'react';

/**
 * ToyBotAvatar - "Mesuri"
 * An interactive, animated SVG & CSS Toy Robot AI Mascot for MESUREGX
 * 
 * Features:
 * - Natural eye blinking every ~3.8 seconds
 * - Interactive expressions: 'idle' | 'thinking' (scanning visor) | 'happy' (curved joy eyes)
 * - Pulsing antenna with emerald status LED
 * - Floating hover physics with soft dynamic ground shadow
 * - Optional friendly floating speech balloon
 */
export default function ToyBotAvatar({
  size = 56,
  expression = 'idle', // 'idle' | 'thinking' | 'happy' | 'winking'
  isFloating = true,
  showSpeechBubble = false,
  bubbleText = "👋 Hi! Ask me anything about MESUREGX!",
  onBubbleClick = null,
  onClick = null,
}) {
  const [blink, setBlink] = useState(false);
  const [internalExpression, setInternalExpression] = useState(expression);
  const [isHovered, setIsHovered] = useState(false);

  // Sync external expression with internal
  useEffect(() => {
    setInternalExpression(expression);
  }, [expression]);

  // Natural blinking timer
  useEffect(() => {
    if (internalExpression === 'thinking') return; // Don't blink while scanning

    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3800);

    return () => clearInterval(blinkInterval);
  }, [internalExpression]);

  const activeExpression = isHovered && internalExpression === 'idle' ? 'happy' : internalExpression;

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Optional Floating Speech Balloon */}
      {showSpeechBubble && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (onBubbleClick) onBubbleClick();
            else if (onClick) onClick();
          }}
          style={{
            position: 'absolute',
            bottom: `${size + 14}px`,
            right: '-10px',
            backgroundColor: '#064E3B',
            color: '#FFFFFF',
            padding: '0.55rem 0.9rem',
            borderRadius: '16px',
            borderBottomRightRadius: '4px',
            fontSize: '0.78rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 24px rgba(6, 78, 59, 0.35), 0 2px 8px rgba(0,0,0,0.12)',
            border: '1.5px solid rgba(16, 185, 129, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            animation: 'toyBotFloatBubble 3s ease-in-out infinite',
            zIndex: 10,
          }}
        >
          <span>{bubbleText}</span>
          <span style={{ fontSize: '0.7rem', color: '#6EE7B7' }}>✨</span>
        </div>
      )}

      {/* The Animated Toy Robot Container */}
      <div
        style={{
          width: size,
          height: size,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: isFloating ? 'toyBotHover 3.2s ease-in-out infinite' : 'none',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isHovered ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Glossy Metallic Body Gradient */}
            <linearGradient id="toyBotBodyGrad" x1="15" y1="20" x2="85" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0F766E" />
              <stop offset="0.5" stopColor="#0D9488" />
              <stop offset="1" stopColor="#042F2E" />
            </linearGradient>

            {/* Glass Visor Gradient */}
            <linearGradient id="toyBotVisorGrad" x1="24" y1="36" x2="76" y2="68" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0F172A" />
              <stop offset="1" stopColor="#020617" />
            </linearGradient>

            {/* Glowing Eye Cyan Gradient */}
            <radialGradient id="toyBotEyeGlow" cx="50%" cy="50%" r="50%">
              <stop stopColor="#38BDF8" />
              <stop offset="0.6" stopColor="#06B6D4" />
              <stop offset="1" stopColor="#0284C7" />
            </radialGradient>

            {/* Antenna LED Glow Filter */}
            <filter id="antennaGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Visor Glare Filter */}
            <linearGradient id="visorGlare" x1="28" y1="38" x2="72" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" stopOpacity="0.22" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 1. Antenna Base & Mast */}
          <rect x="47.5" y="10" width="5" height="12" rx="2.5" fill="#14B8A6" />
          <line x1="50" y1="12" x2="50" y2="20" stroke="#042F2E" strokeWidth="1.5" />

          {/* 2. Antenna Glowing Tip (LED Sensor) */}
          <circle
            cx="50"
            cy="8"
            r={activeExpression === 'thinking' ? 5 : 4}
            fill="#10B981"
            filter="url(#antennaGlow)"
            className="animate-pulse"
          />
          <circle cx="49" cy="7" r="1.5" fill="#FFFFFF" opacity="0.8" />

          {/* 3. Left & Right Ear Headphone Pods */}
          {/* Left Pod */}
          <rect x="8" y="40" width="8" height="24" rx="4" fill="#0D9488" stroke="#042F2E" strokeWidth="1.5" />
          <circle cx="12" cy="52" r="2.5" fill="#10B981" />

          {/* Right Pod */}
          <rect x="84" y="40" width="8" height="24" rx="4" fill="#0D9488" stroke="#042F2E" strokeWidth="1.5" />
          <circle cx="88" cy="52" r="2.5" fill="#10B981" />

          {/* 4. Rounded Robot Head Body */}
          <rect
            x="16"
            y="22"
            width="68"
            height="62"
            rx="20"
            fill="url(#toyBotBodyGrad)"
            stroke="#14B8A6"
            strokeWidth="2"
          />

          {/* Subtle Top Head Highlight */}
          <path
            d="M 26 26 Q 50 23 74 26"
            stroke="#2DD4BF"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* 5. The Glass Visor Screen */}
          <rect
            x="24"
            y="34"
            width="52"
            height="38"
            rx="12"
            fill="url(#toyBotVisorGrad)"
            stroke="#0D9488"
            strokeWidth="1.5"
          />

          {/* Glossy Reflection Arc across Visor */}
          <path
            d="M 27 38 C 38 36 62 36 73 38 C 65 44 35 44 27 38 Z"
            fill="url(#visorGlare)"
          />

          {/* 6. Dynamic Expressive Digital Eyes / Visor Display */}

          {/* EXPRESSION A: THINKING / SCANNING VISOR */}
          {activeExpression === 'thinking' && (
            <g>
              {/* Pulsing Scan Beam */}
              <rect x="27" y="50" width="46" height="5" rx="2.5" fill="#0891B2" opacity="0.3" />
              <rect
                x="30"
                y="48"
                width="18"
                height="9"
                rx="4.5"
                fill="#38BDF8"
                filter="url(#antennaGlow)"
              >
                <animate
                  attributeName="x"
                  values="27; 55; 27"
                  dur="1.2s"
                  repeatCount="indefinite"
                  ease="easeInOut"
                />
              </rect>
              {/* Auxiliary processing dots */}
              <circle cx="36" cy="40" r="1.5" fill="#34D399" />
              <circle cx="43" cy="40" r="1.5" fill="#34D399" />
              <circle cx="50" cy="40" r="1.5" fill="#38BDF8" />
              <circle cx="57" cy="40" r="1.5" fill="#34D399" />
              <circle cx="64" cy="40" r="1.5" fill="#34D399" />
            </g>
          )}

          {/* EXPRESSION B: HAPPY / JOYFUL SMILING EYES (^ ^) */}
          {activeExpression === 'happy' && (
            <g stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              {/* Left Eye: ^ */}
              <path d="M 34 54 Q 40 44 46 54" filter="url(#antennaGlow)" />
              {/* Right Eye: ^ */}
              <path d="M 54 54 Q 60 44 66 54" filter="url(#antennaGlow)" />
              {/* Little cute smile light */}
              <circle cx="50" cy="62" r="1.5" fill="#34D399" stroke="none" />
            </g>
          )}

          {/* EXPRESSION C: NORMAL / IDLE BLINKING EYES */}
          {activeExpression === 'idle' && (
            <g>
              {blink ? (
                // Blinking: Sleek closed eye slits
                <g stroke="#38BDF8" strokeWidth="3" strokeLinecap="round">
                  <line x1="33" y1="52" x2="45" y2="52" />
                  <line x1="55" y1="52" x2="67" y2="52" />
                </g>
              ) : (
                // Open Eyes: Bright Glowing Digital Circles
                <g>
                  {/* Left Eye */}
                  <circle cx="39" cy="52" r="6" fill="url(#toyBotEyeGlow)" filter="url(#antennaGlow)" />
                  <circle cx="37" cy="50" r="2" fill="#FFFFFF" opacity="0.9" />
                  <circle cx="41" cy="53" r="1" fill="#FFFFFF" opacity="0.6" />

                  {/* Right Eye */}
                  <circle cx="61" cy="52" r="6" fill="url(#toyBotEyeGlow)" filter="url(#antennaGlow)" />
                  <circle cx="59" cy="50" r="2" fill="#FFFFFF" opacity="0.9" />
                  <circle cx="63" cy="53" r="1" fill="#FFFFFF" opacity="0.6" />

                  {/* Gentle digital micro-status tick below */}
                  <rect x="47" y="62" width="6" height="2" rx="1" fill="#10B981" opacity="0.75" />
                </g>
              )}
            </g>
          )}

          {/* 7. Bottom Collar / Body Joint */}
          <rect x="36" y="84" width="28" height="6" rx="3" fill="#0D9488" stroke="#042F2E" strokeWidth="1" />
          <line x1="43" y1="84" x2="43" y2="90" stroke="#042F2E" strokeWidth="1" />
          <line x1="50" y1="84" x2="50" y2="90" stroke="#042F2E" strokeWidth="1" />
          <line x1="57" y1="84" x2="57" y2="90" stroke="#042F2E" strokeWidth="1" />
        </svg>
      </div>

      {/* Soft Floating Shadow Beneath Avatar */}
      {isFloating && (
        <div
          style={{
            width: size * 0.55,
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'rgba(15, 23, 42, 0.22)',
            marginTop: '3px',
            animation: 'toyBotShadow 3.2s ease-in-out infinite',
            filter: 'blur(2px)',
          }}
        />
      )}

      {/* Global Embedded Styles for Smooth Mascot Physics */}
      <style>{`
        @keyframes toyBotHover {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-7px);
          }
        }
        @keyframes toyBotShadow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.35;
          }
          50% {
            transform: scale(0.72);
            opacity: 0.15;
          }
        }
        @keyframes toyBotFloatBubble {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
}
