import React from 'react';

/**
 * ParticleField: Ultra-lightweight ambient CSS particle grid.
 * Eliminates duplicate Canvas 2D requestAnimationFrame loops and software blur filters,
 * delegating all dynamic particle rendering to the primary Three.js WebGL GPU pipeline.
 */
export default function ParticleField() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        backgroundImage:
          'radial-gradient(1.2px 1.2px at 30px 40px, rgba(0, 217, 255, 0.45), transparent), radial-gradient(1.2px 1.2px at 150px 190px, rgba(22, 139, 255, 0.35), transparent)',
        backgroundSize: '220px 220px',
        opacity: 0.55,
      }}
      aria-hidden="true"
    />
  );
}
