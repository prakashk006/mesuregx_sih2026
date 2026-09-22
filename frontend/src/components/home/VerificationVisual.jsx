import React from 'react';
import Metrology3DScene from '../Metrology3DScene';

/**
 * VerificationVisual: Futuristic 3D Interactive Weighing Scale and Metrology Verification Scene.
 * Fully isolated component with 3D depth, particle system, concentric rotating platform,
 * live verification card, floating certificate, QR scanning animations, and mouse parallax.
 */
export default function VerificationVisual(props) {
  return <Metrology3DScene {...props} />;
}
