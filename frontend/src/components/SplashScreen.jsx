import React, { useState, useEffect, useCallback } from 'react';
import './SplashScreen.css';

/**
 * MEASUREGX Ultra-Smooth Cinematic Intro Splash Screen
 * 
 * Cinematic Timeline:
 * - 0.0s - 0.9s: 3D Isometric cube floats up, glides into focus with ambient glow.
 * - 0.9s - 1.8s: "measuregx" brand typography & official tagline expand with precision letter-spacing.
 * - 1.8s - 2.8s: Dynamic facet shimmer sweep & subtle metrology pulse.
 * - 2.8s - 3.5s: Silky exit dissolve — smooth opacity fade, gentle scale zoom (1.0 -> 1.03) & backdrop reveal.
 */
export default function SplashScreen({ forceShow = false, onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const finishSplash = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      sessionStorage.setItem('measuregx_splash_seen', 'true');
      document.body.style.overflow = '';
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 600); // 600ms silky exit transition
  }, [onComplete]);

  useEffect(() => {
    // Check if splash was already shown in this tab session
    const hasSeen = sessionStorage.getItem('measuregx_splash_seen');
    const urlParams = new URLSearchParams(window.location.search);
    const splashParam = urlParams.get('splash'); // allow ?splash=1 to force test

    if (hasSeen && !forceShow && splashParam !== '1') {
      setIsVisible(false);
      if (onComplete) onComplete();
      return;
    }

    document.body.style.overflow = 'hidden';

    // Auto-transition to exit phase at 2.9 seconds
    const exitTimer = setTimeout(() => {
      finishSplash();
    }, 2900);

    // Global replay event listener
    const handleReplay = () => {
      sessionStorage.removeItem('measuregx_splash_seen');
      setIsExiting(false);
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      setTimeout(() => finishSplash(), 2900);
    };

    window.addEventListener('measuregx:replay_splash', handleReplay);

    return () => {
      clearTimeout(exitTimer);
      window.removeEventListener('measuregx:replay_splash', handleReplay);
      document.body.style.overflow = '';
    };
  }, [forceShow, finishSplash, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`mgx-splash-overlay ${isExiting ? 'mgx-splash-is-exiting' : ''}`}
      id="measuregx-splash-screen"
      onClick={finishSplash}
      title="Click anywhere to skip intro"
    >
      {/* Ambient Metrology Aura Glow */}
      <div className="mgx-splash-ambient-glow" />

      {/* Skip Button */}
      <button
        type="button"
        className="mgx-splash-skip-btn"
        onClick={(e) => {
          e.stopPropagation();
          finishSplash();
        }}
        aria-label="Skip Intro"
      >
        Skip ✕
      </button>

      <div className="mgx-splash-container">
        {/* 3D Isometric Cube Brand Logo Icon */}
        <div className="mgx-splash-logo-wrapper">
          <svg
            className="mgx-splash-cube-svg"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Top Facet Gradient (Sky Azure to Emerald Green) */}
              <linearGradient id="topFacetGrad" x1="40" y1="25" x2="160" y2="95" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E0F2FE" />
                <stop offset="40%" stopColor="#38BDF8" />
                <stop offset="85%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>

              {/* Left Facet Gradient (Deep Navy Blue) */}
              <linearGradient id="leftFacetGrad" x1="40" y1="65" x2="95" y2="175" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1D4ED8" />
                <stop offset="60%" stopColor="#0B2545" />
                <stop offset="100%" stopColor="#061A30" />
              </linearGradient>

              {/* Right Facet Gradient (Vibrant Azure) */}
              <linearGradient id="rightFacetGrad" x1="105" y1="65" x2="160" y2="175" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#007BFF" />
                <stop offset="70%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#0369A1" />
              </linearGradient>
            </defs>

            {/* TOP FACET: Isometric Rhombus with Curved Green Accent */}
            <path
              className="mgx-facet-shimmer"
              d="M 100 25 L 160 60 L 100 95 L 40 60 Z"
              fill="url(#topFacetGrad)"
            />
            <path
              d="M 60 48.3 C 90 35, 120 70, 160 60 L 100 95 L 40 60 Z"
              fill="#10B981"
              opacity="0.88"
            />

            {/* LEFT FACET: Deep Navy Isometric Prism Face */}
            <path
              className="mgx-facet-shimmer"
              d="M 40 65 L 95 100 L 95 175 L 40 140 Z"
              fill="url(#leftFacetGrad)"
            />
            <path
              d="M 52 82 C 68 70, 85 98, 85 130 L 95 136 L 95 100 L 40 65 Z"
              fill="#0B2545"
              opacity="0.65"
            />

            {/* RIGHT FACET: Vibrant Azure Blue with Metrology Ruler Ticks */}
            <path
              className="mgx-facet-shimmer"
              d="M 105 100 L 160 65 L 160 140 L 105 175 Z"
              fill="url(#rightFacetGrad)"
            />

            {/* Metrology Precision Ruler Tick Marks on Right Facet */}
            <g stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.95">
              <line x1="106" y1="114" x2="124" y2="103" />
              <line x1="106" y1="126" x2="120" y2="117" />
              <line x1="106" y1="138" x2="124" y2="127" />
              <line x1="106" y1="150" x2="120" y2="141" />
              <line x1="106" y1="162" x2="124" y2="151" />
            </g>

            {/* Crisp Modular Facet Dividers */}
            <path
              d="M 100 25 L 160 60 L 100 95 L 40 60 Z"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              fill="none"
            />
            <line x1="97.5" y1="97" x2="97.5" y2="178" stroke="#FFFFFF" strokeWidth="4.5" />
          </svg>
        </div>

        {/* Brand Typography */}
        <div className="mgx-splash-brand-text">
          <span className="mgx-brand-measure">measure</span>
          <span className="mgx-brand-gx">gx</span>
        </div>

        {/* Tagline Subtitle */}
        <div className="mgx-splash-tagline">
          — EVERY MEASURE MATTERS —
        </div>

        {/* Mobile / Web Progress Fill Line */}
        <div className="mgx-splash-progress-bar">
          <div className="mgx-splash-progress-fill" />
        </div>
      </div>
    </div>
  );
}
