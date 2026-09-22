import React, { useState, useEffect, useRef, Component } from 'react';
import MetrologyWebGLCanvas from './MetrologyWebGLCanvas';
import HolographicPlatform from './HolographicPlatform';
import WeighingScale3D from './WeighingScale3D';
import VerificationCard from './VerificationCard';
import CertificateCard from './CertificateCard';
import FloatingQRElements from './FloatingQRElements';
import LegalMetrologyIcons from './LegalMetrologyIcons';
import NetworkLines from './NetworkLines';
import ParticleField from './ParticleField';
import './Metrology3DScene.css';

// Error Boundary to ensure zero-risk WebGL isolation
class MetrologyErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[Metrology3DScene] Rendering error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="m3d-container">
          <div className="m3d-ambient-glow" />
          <HolographicPlatform />
          <WeighingScale3D showFallbackPlatter={true} />
        </div>
      );
    }
    return this.props.children;
  }
}

function Metrology3DSceneInner({
  certificateId = 'MGX-2025-784562',
  standard = 'OIML R76',
  accuracy = '99.98%',
  tolerance = '0.02%',
  status = 'Within Limit',
}) {
  const [verificationState, setVerificationState] = useState('IDLE');
  const [scaleValue, setScaleValue] = useState('0.000');
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  const containerRef = useRef(null);
  const backLayerRef = useRef(null);
  const middleLayerRef = useRef(null);
  const frontLayerRef = useRef(null);

  const mousePosRef = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const reqId = useRef(null);
  const timerRefs = useRef([]);

  const clearAllTimers = () => {
    timerRefs.current.forEach((t) => clearTimeout(t));
    timerRefs.current = [];
  };

  // State Machine Trigger
  const startVerification = () => {
    clearAllTimers();
    setVerificationState('INITIALIZING');
    setScaleValue('0.000');

    // 1. Scanning Phase
    const t1 = setTimeout(() => {
      setVerificationState('SCANNING');
      setScaleValue('0.125');
    }, 650);

    // 2. Measuring Phase
    const t2 = setTimeout(() => {
      setVerificationState('MEASURING');
      setScaleValue('0.500');
    }, 1400);

    const t3 = setTimeout(() => {
      setScaleValue('1.250');
    }, 2000);

    const t4 = setTimeout(() => {
      setScaleValue('1.500');
    }, 2600);

    // 3. Stabilizing Phase
    const t5 = setTimeout(() => {
      setVerificationState('STABILIZING');
      setScaleValue('1.498');
    }, 3100);

    const t6 = setTimeout(() => {
      setScaleValue('1.502');
    }, 3350);

    const t7 = setTimeout(() => {
      setScaleValue('1.500');
    }, 3600);

    // 4. Verified & Certified Phase
    const t8 = setTimeout(() => {
      setVerificationState('VERIFIED');
      setScaleValue('1.500');
    }, 3950);

    timerRefs.current = [t1, t2, t3, t4, t5, t6, t7, t8];
  };

  const resetVerification = () => {
    clearAllTimers();
    setVerificationState('IDLE');
    setScaleValue('0.000');
  };

  // Auto-run verification demonstration once on initial entry
  useEffect(() => {
    const initTimer = setTimeout(() => {
      startVerification();
    }, 1800);
    return () => {
      clearTimeout(initTimer);
      clearAllTimers();
    };
  }, []);

  // Smooth mouse parallax loop without any React re-renders
  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    const animate = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.08;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.08;

      mousePosRef.current = currentPos.current;
      const x = currentPos.current.x;
      const y = currentPos.current.y;

      if (backLayerRef.current) {
        backLayerRef.current.style.transform = `translate3d(${x * 0.2}px, ${y * 0.2}px, -40px)`;
      }
      if (middleLayerRef.current) {
        middleLayerRef.current.style.transform = `translate3d(${x * 0.75}px, ${y * 0.75}px, 0px)`;
      }
      if (frontLayerRef.current) {
        frontLayerRef.current.style.transform = `translate3d(${x * 0.4}px, ${y * 0.4}px, 40px)`;
      }

      reqId.current = requestAnimationFrame(animate);
    };

    reqId.current = requestAnimationFrame(animate);

    return () => {
      if (reqId.current) cancelAnimationFrame(reqId.current);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 24;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 24;
    targetPos.current = { x, y };
  };

  const handleMouseLeave = () => {
    targetPos.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={containerRef}
      className="m3d-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. BACK LAYER */}
      <div
        ref={backLayerRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        <div className="m3d-ambient-glow" />
        <div className="m3d-holo-beam" />
        <ParticleField />
      </div>

      {/* 2. REAL 3D WEBGL THREE.JS CANVAS */}
      {isWebGLSupported && (
        <MetrologyWebGLCanvas
          verificationState={verificationState}
          onScaleClick={startVerification}
          mousePosRef={mousePosRef}
        />
      )}

      {/* 3. MIDDLE LAYER: Floating cards and network */}
      <div
        ref={middleLayerRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'auto',
          zIndex: 10,
        }}
      >
        <NetworkLines />

        <CertificateCard
          verificationState={verificationState}
          certificateId={certificateId}
          standard={`${standard} • Class III`}
        />

        <VerificationCard
          verificationState={verificationState}
          certificateId={certificateId}
          standard={standard}
          accuracy={accuracy}
          tolerance={tolerance}
          status={status}
        />

        <FloatingQRElements />
        <LegalMetrologyIcons />
      </div>

      {/* 4. FRONT LAYER: Digital Instrument Console */}
      <div
        ref={frontLayerRef}
        style={{
          zIndex: 25,
          pointerEvents: 'auto',
        }}
      >
        <WeighingScale3D
          verificationState={verificationState}
          scaleValue={scaleValue}
          onStartVerification={startVerification}
          onReset={resetVerification}
          showFallbackPlatter={!isWebGLSupported}
        />
      </div>
    </div>
  );
}

export default function Metrology3DScene(props) {
  return (
    <MetrologyErrorBoundary>
      <Metrology3DSceneInner {...props} />
    </MetrologyErrorBoundary>
  );
}
