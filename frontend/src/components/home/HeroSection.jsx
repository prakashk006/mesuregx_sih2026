import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Network } from 'lucide-react';
import VerificationVisual from './VerificationVisual';
import TrustIndicators from './TrustIndicators';
import './HeroSection.css';

// 22 subtle background network points (rendered once, zero runtime overhead)
const BACKGROUND_PARTICLES = [
  { x: '8%', y: '22%', r: 1.6, opacity: 0.28 },
  { x: '22%', y: '16%', r: 2.0, opacity: 0.35 },
  { x: '14%', y: '58%', r: 1.5, opacity: 0.22 },
  { x: '28%', y: '74%', r: 1.8, opacity: 0.30 },
  { x: '36%', y: '26%', r: 1.6, opacity: 0.25 },
  { x: '44%', y: '48%', r: 2.2, opacity: 0.32 },
  { x: '32%', y: '86%', r: 1.5, opacity: 0.24 },
  { x: '52%', y: '18%', r: 1.8, opacity: 0.28 },
  { x: '58%', y: '62%', r: 1.5, opacity: 0.20 },
  { x: '68%', y: '24%', r: 2.0, opacity: 0.25 },
  { x: '64%', y: '82%', r: 1.6, opacity: 0.22 },
  { x: '76%', y: '42%', r: 1.8, opacity: 0.24 },
  { x: '84%', y: '16%', r: 1.5, opacity: 0.25 },
  { x: '92%', y: '35%', r: 1.8, opacity: 0.20 },
  { x: '86%', y: '78%', r: 1.5, opacity: 0.22 },
  { x: '18%', y: '90%', r: 1.8, opacity: 0.25 },
  { x: '42%', y: '78%', r: 1.5, opacity: 0.28 },
  { x: '48%', y: '32%', r: 2.0, opacity: 0.26 },
  { x: '72%', y: '68%', r: 1.6, opacity: 0.22 },
  { x: '80%', y: '88%', r: 1.8, opacity: 0.24 },
  { x: '90%', y: '60%', r: 1.5, opacity: 0.20 },
  { x: '96%', y: '82%', r: 1.8, opacity: 0.22 },
];

export default function HeroSection({ onVerifyClick, onExploreClick }) {
  const heroRef = useRef(null);
  const atmosphereRef = useRef(null);
  const networkRef = useRef(null);
  const rightColRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Trigger cinematic reveal once when hero enters viewport or loads
  useEffect(() => {
    const el = heroRef.current;
    if (!el) {
      setIsRevealed(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 150);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Subtle mouse parallax
  const handleMouseMove = (e) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!heroRef.current) return;

    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;

    if (atmosphereRef.current) {
      atmosphereRef.current.style.transform = `translate3d(${x * 0.1}px, ${y * 0.1}px, 0)`;
    }
    if (networkRef.current) {
      networkRef.current.style.transform = `translate3d(${x * 0.18}px, ${y * 0.18}px, 0)`;
    }
    if (rightColRef.current) {
      rightColRef.current.style.transform = `translate3d(${x * 0.35}px, ${y * 0.35}px, 0)`;
    }
  };

  const handleMouseLeave = () => {
    if (atmosphereRef.current) {
      atmosphereRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
    if (networkRef.current) {
      networkRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
    if (rightColRef.current) {
      rightColRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={isRevealed ? 'hero-revealed' : ''}
      style={{
        position: 'relative',
        padding: '3.5rem 1.5rem 3.5rem',
        overflow: 'hidden',
        minHeight: '660px',
        maxHeight: '800px',
        display: 'flex',
        alignItems: 'center',
        background: '#F9FAFB',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      {/* 1. BACK LAYER: Soft, wide atmospheric lighting */}
      <div ref={atmosphereRef} className="hero-atmosphere-back" />

      {/* 2. MIDDLE LAYER: Barely-visible technical grid & subtle network connections */}
      <div className="hero-technical-grid" />

      {/* Subtle Network Lines & Drifting Points */}
      <svg
        ref={networkRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <defs>
          <linearGradient id="netLineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(15, 118, 110, 0.01)" />
            <stop offset="50%" stopColor="rgba(15, 118, 110, 0.07)" />
            <stop offset="100%" stopColor="rgba(15, 118, 110, 0.01)" />
          </linearGradient>
        </defs>

        <path
          d="M 60 180 L 220 140 L 400 240 L 540 160"
          stroke="url(#netLineGrad1)"
          strokeWidth="1"
          strokeDasharray="4 6"
          fill="none"
        />
        <path
          d="M 120 440 L 280 360 L 460 390 L 620 320"
          stroke="url(#netLineGrad1)"
          strokeWidth="1"
          strokeDasharray="4 6"
          fill="none"
        />
        <path
          d="M 320 120 L 480 210 L 650 140"
          stroke="url(#netLineGrad1)"
          strokeWidth="1"
          strokeDasharray="4 6"
          fill="none"
        />

        {BACKGROUND_PARTICLES.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill="#10B981"
            opacity={p.opacity}
            className={`node-anim-${i % 3}`}
          />
        ))}
      </svg>

      {/* 3. FRONT LAYER: Hero Content */}
      <div
        style={{
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          className="hero-grid-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '0.85fr 1.15fr',
            gap: '2.5rem',
            alignItems: 'center',
          }}
        >
          {/* LEFT COLUMN: ~42% */}
          <div style={{ maxWidth: '580px' }}>
            {/* Small Uppercase Cyan Eyebrow Badge */}
            <div className="hero-anim-badge">
              <div className="hero-eyebrow-badge">
                <div className="hero-radar-dot" />
                <span>NATIONAL LEGAL METROLOGY DIGITAL NETWORK</span>
              </div>
            </div>

            {/* CINEMATIC MASKED TEXT REVEAL: Trust Every Measure. */}
            <h1 className="hero-heading-root">
              {/* Line 1: Trust Every (Masked upward reveal 100ms -> 350ms) */}
              <span className="hero-mask-line">
                <span className="hero-text-line hero-line-1">
                  <span className="hero-title-white">Trust Every</span>
                </span>
              </span>

              {/* Line 2: Measure. (Masked upward reveal 450ms -> 750ms + light sweep at 850ms) */}
              <span className="hero-mask-line">
                <span className="hero-text-line hero-line-2">
                  <span className="hero-measure-wrapper">
                    <span className="hero-measure-word">Measure.</span>
                    <span className="hero-measure-sweep-container">
                      <span className="hero-measure-sweep" />
                    </span>
                  </span>
                </span>
              </span>
            </h1>

            {/* Subtitle: Staggered Fade-in */}
            <div className="hero-anim-subtitle">
              <p className="hero-subtitle-text">
                India's digital infrastructure for verified commercial instruments. Empowering national trade with mathematical accuracy, OIML standards, and cryptographic QR digital certification.
              </p>
            </div>

            {/* Two CTAs: Staggered Fade-in */}
            <div
              className="hero-anim-cta"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                flexWrap: 'wrap',
                marginBottom: '1.25rem',
              }}
            >
              <button
                type="button"
                onClick={onVerifyClick}
                className="btn-cyber-primary hero-cta-primary"
                style={{
                  padding: '0.8rem 1.65rem',
                  fontSize: '0.95rem',
                }}
              >
                <ShieldCheck size={18} color="#FFFFFF" strokeWidth={2.5} />
                <span>Verify an Instrument →</span>
              </button>

              <button
                type="button"
                onClick={onExploreClick}
                className="btn-cyber-secondary hero-cta-secondary"
                style={{
                  padding: '0.8rem 1.65rem',
                  fontSize: '0.95rem',
                }}
              >
                <Network size={18} color="#064E3B" />
                <span>Explore the Network</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="hero-anim-trust">
              <TrustIndicators />
            </div>
          </div>

          {/* RIGHT COLUMN: ~58% — Futuristic Verification Ecosystem with subtle parallax */}
          <div
            ref={rightColRef}
            style={{
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <VerificationVisual />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .hero-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }
      `}</style>
    </section>
  );
}
