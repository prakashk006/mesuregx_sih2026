import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * MetrologyWebGLCanvas: Real 3D WebGL Scene using Three.js.
 * Harmonized to the Bharat Seva / Progressive Civic Government Palette:
 * - #064E3B (Midnight Teal metallic scale base chassis)
 * - #10B981 (Mint Green platter rim & laser scanning plane)
 * - #EA580C (Vivid Saffron concentric platform ring)
 * - #2563EB (Civic Blue middle concentric platform ring)
 * - #F59E0B / #D97706 (Sovereign polished brass calibration test weight)
 * - 60 FPS performance pipeline strictly preserved
 */
export default function MetrologyWebGLCanvas({
  verificationState = 'IDLE',
  onScaleClick,
  mousePosRef,
}) {
  const mountRef = useRef(null);
  const stateRef = useRef(verificationState);
  stateRef.current = verificationState;

  const fallbackMouseRef = useRef({ x: 0, y: 0 });
  const activeMouseRef = mousePosRef || fallbackMouseRef;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 720;
    let height = container.clientHeight || 560;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xF9FAFB, 0.025);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 2.8, 8.2);
    camera.lookAt(0, 0.3, 0);

    // 2. WebGL Renderer with Performance-Optimized Settings
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        precision: 'mediump',
      });
      renderer.setSize(width, height);
      const isMobile = window.innerWidth <= 768;
      const maxDpr = isMobile ? 1.25 : 1.5;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('[Metrology3D] WebGL not available:', e);
      return;
    }

    // 3. Lighting Setup (Harmonized Civic Government Lighting)
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.1);
    scene.add(ambientLight);

    // Key Light: Crisp Mint/Teal
    const keyLight = new THREE.DirectionalLight(0x10B981, 2.2);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    // Rim Light: Warm Saffron
    const rimLight = new THREE.DirectionalLight(0xEA580C, 2.0);
    rimLight.position.set(-6, 4, -4);
    scene.add(rimLight);

    // Bottom Platform Glow Light
    const bottomGlowLight = new THREE.PointLight(0x10B981, 2.4, 9);
    bottomGlowLight.position.set(0, -0.6, 0);
    scene.add(bottomGlowLight);

    // Dynamic Platter Laser Light
    const laserPointLight = new THREE.PointLight(0x10B981, 1.6, 4);
    laserPointLight.position.set(0, 1.5, 0);
    scene.add(laserPointLight);

    // 4. Shared Reusable Geometries & Materials
    // Deep Midnight Teal metallic base
    const darkMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0x064E3B,
      roughness: 0.35,
      metalness: 0.8,
    });

    const brushedSteelMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.25,
      metalness: 0.85,
    });

    // Optical crystal glass platter
    const glassPlatterMaterial = new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      transparent: true,
      opacity: 0.85,
      roughness: 0.12,
      metalness: 0.6,
      emissive: 0x064E3B,
      emissiveIntensity: 0.2,
    });

    // Sovereign Polished Brass Calibration Test Weight
    const brassWeightMaterial = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      roughness: 0.22,
      metalness: 0.9,
      emissive: 0xD97706,
      emissiveIntensity: 0.35,
    });

    const mintGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x10B981,
      transparent: true,
      opacity: 0.85,
    });

    const saffronGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xEA580C,
      transparent: true,
      opacity: 0.9,
    });

    // 5. 3D Weighing Scale Assembly
    const scaleGroup = new THREE.Group();
    scaleGroup.position.set(0, -0.15, 0);
    scene.add(scaleGroup);

    // 5a. Scale Base Chassis
    const baseBottomGeo = new THREE.CylinderGeometry(2.1, 2.4, 0.4, 32);
    const baseBottom = new THREE.Mesh(baseBottomGeo, darkMetalMaterial);
    baseBottom.position.y = -0.55;
    scaleGroup.add(baseBottom);

    // Base glowing ring seam (Mint)
    const baseSeamRingGeo = new THREE.TorusGeometry(2.12, 0.025, 16, 48);
    const baseSeamRing = new THREE.Mesh(baseSeamRingGeo, mintGlowMaterial);
    baseSeamRing.rotation.x = Math.PI / 2;
    baseSeamRing.position.y = -0.35;
    scaleGroup.add(baseSeamRing);

    // Base Upper Housing
    const baseUpperGeo = new THREE.CylinderGeometry(1.8, 2.05, 0.45, 32);
    const baseUpper = new THREE.Mesh(baseUpperGeo, brushedSteelMaterial);
    baseUpper.position.y = -0.18;
    scaleGroup.add(baseUpper);

    // 5b. Cantilever Column / Load Cell Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.38, 0.45, 0.55, 24);
    const pillar = new THREE.Mesh(pillarGeo, darkMetalMaterial);
    pillar.position.y = 0.25;
    scaleGroup.add(pillar);

    // 5c. Moving Platter Assembly
    const platterGroup = new THREE.Group();
    platterGroup.position.y = 0.55;
    scaleGroup.add(platterGroup);

    // Platter Sub-Mount
    const platterMountGeo = new THREE.CylinderGeometry(0.8, 0.5, 0.12, 28);
    const platterMount = new THREE.Mesh(platterMountGeo, darkMetalMaterial);
    platterGroup.add(platterMount);

    // Glass Platter Disc
    const platterDiscGeo = new THREE.CylinderGeometry(1.95, 1.95, 0.1, 36);
    const platterDisc = new THREE.Mesh(platterDiscGeo, glassPlatterMaterial);
    platterDisc.position.y = 0.1;
    platterGroup.add(platterDisc);

    // Platter Outer Glowing Rim (Mint)
    const platterRimGeo = new THREE.TorusGeometry(1.95, 0.03, 16, 48);
    const platterRim = new THREE.Mesh(platterRimGeo, mintGlowMaterial);
    platterRim.rotation.x = Math.PI / 2;
    platterRim.position.y = 0.1;
    platterGroup.add(platterRim);

    // Grid lines on platter
    const gridHelper = new THREE.PolarGridHelper(1.8, 6, 8, 32, 0x10B981, 0x064E3B);
    gridHelper.position.y = 0.16;
    gridHelper.material.opacity = 0.45;
    gridHelper.material.transparent = true;
    platterGroup.add(gridHelper);

    // 5d. 3D Sovereign Brass Calibration Weight
    const weightGroup = new THREE.Group();
    weightGroup.position.y = 0.16;
    platterGroup.add(weightGroup);

    // Weight Main Body
    const weightBodyGeo = new THREE.CylinderGeometry(0.48, 0.55, 0.65, 28);
    const weightBody = new THREE.Mesh(weightBodyGeo, brassWeightMaterial);
    weightBody.position.y = 0.33;
    weightGroup.add(weightBody);

    // Weight Knob Handle
    const weightKnobGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.22, 20);
    const weightKnob = new THREE.Mesh(weightKnobGeo, brushedSteelMaterial);
    weightKnob.position.y = 0.72;
    weightGroup.add(weightKnob);

    const weightTopBallGeo = new THREE.SphereGeometry(0.16, 20, 20);
    const weightTopBall = new THREE.Mesh(weightTopBallGeo, brassWeightMaterial);
    weightTopBall.position.y = 0.86;
    weightGroup.add(weightTopBall);

    // 6. Concentric Platform Rings (Mint, Civic Blue, Vivid Saffron)
    const platformRingsGroup = new THREE.Group();
    platformRingsGroup.position.y = -0.78;
    platformRingsGroup.rotation.x = Math.PI / 2;
    scene.add(platformRingsGroup);

    // Outer Ring: Mint
    const outerRingGeo = new THREE.RingGeometry(3.2, 3.25, 48);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x10B981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    platformRingsGroup.add(outerRing);

    // Middle Ring: Civic Blue
    const middleRingGeo = new THREE.RingGeometry(2.7, 2.74, 48);
    const middleRingMat = new THREE.MeshBasicMaterial({
      color: 0x2563EB,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const middleRing = new THREE.Mesh(middleRingGeo, middleRingMat);
    platformRingsGroup.add(middleRing);

    // Inner Ring: Vivid Saffron
    const innerRingGeo = new THREE.RingGeometry(2.2, 2.23, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xEA580C,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    platformRingsGroup.add(innerRing);

    // Orbiting Beacons
    const beacon1Geo = new THREE.SphereGeometry(0.06, 12, 12);
    const beacon2Geo = new THREE.SphereGeometry(0.05, 12, 12);
    const beacon1 = new THREE.Mesh(beacon1Geo, mintGlowMaterial);
    const beacon2 = new THREE.Mesh(beacon2Geo, saffronGlowMaterial);
    middleRing.add(beacon1);
    middleRing.add(beacon2);
    beacon1.position.set(2.72, 0, 0.02);
    beacon2.position.set(-2.72, 0, 0.02);

    // 7. Scanning Laser Plane (Emerald Mint)
    const laserPlaneGeo = new THREE.PlaneGeometry(4.2, 0.06);
    const laserPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x10B981,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const laserPlane = new THREE.Mesh(laserPlaneGeo, laserPlaneMat);
    laserPlane.rotation.x = Math.PI / 2;
    laserPlane.position.y = 0.7;
    scene.add(laserPlane);

    // 8. 3D Particle Starfield (Mint & Saffron)
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = Math.random() * 8 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      // Color split: Mint green, Saffron, Civic blue
      const r = Math.random();
      if (r < 0.5) {
        // Mint
        colors[i * 3] = 0.06;
        colors[i * 3 + 1] = 0.72;
        colors[i * 3 + 2] = 0.5;
      } else if (r < 0.8) {
        // Saffron
        colors[i * 3] = 0.91;
        colors[i * 3 + 1] = 0.35;
        colors[i * 3 + 2] = 0.05;
      } else {
        // Civic Blue
        colors[i * 3] = 0.14;
        colors[i * 3 + 1] = 0.38;
        colors[i * 3 + 2] = 0.92;
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 9. Event-Driven Raycasting (Hover & Click)
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2(-999, -999);
    let needsRaycastCheck = false;
    const interactiveObjects = [platterDisc, baseUpper, weightBody, baseBottom];

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      needsRaycastCheck = true;
    };

    const handlePointerLeave = () => {
      mouseVector.x = -999;
      mouseVector.y = -999;
      needsRaycastCheck = true;
    };

    const handleCanvasClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects);

      if (intersects.length > 0 && onScaleClick) {
        onScaleClick();
      }
    };

    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    container.addEventListener('click', handleCanvasClick);

    // 10. Frame-Rate Independent Animation Loop
    let animId = null;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();
      const state = stateRef.current;
      const mouse = activeMouseRef.current || { x: 0, y: 0 };

      // Concentric platform rings rotation
      outerRing.rotation.z += delta * 0.12;
      middleRing.rotation.z -= delta * 0.18;
      innerRing.rotation.z += delta * 0.24;

      // Laser scan plane animation
      if (state === 'SCANNING' || state === 'MEASURING') {
        laserPlane.visible = true;
        laserPlane.position.y = 0.8 + Math.sin(time * 3.5) * 0.7;
        laserPointLight.intensity = 2.5 + Math.sin(time * 6) * 1.0;
      } else if (state === 'VERIFIED') {
        laserPlane.visible = true;
        laserPlane.position.y = 0.8 + Math.sin(time * 1.5) * 0.3;
        laserPointLight.intensity = 1.8;
      } else {
        laserPlane.visible = true;
        laserPlane.position.y = 0.8 + Math.sin(time * 1.2) * 0.5;
        laserPointLight.intensity = 1.2;
      }

      // Platter & weight dynamic physics
      if (state === 'MEASURING') {
        const dip = Math.sin(time * 6) * 0.04 - 0.04;
        platterGroup.position.y = 0.55 + dip;
      } else if (state === 'STABILIZING') {
        const settle = Math.sin(time * 10) * 0.015 - 0.02;
        platterGroup.position.y = 0.55 + settle;
      } else if (state === 'VERIFIED') {
        platterGroup.position.y = 0.53;
      } else {
        platterGroup.position.y = 0.55;
      }

      // Weight subtle rotation
      weightGroup.rotation.y = Math.sin(time * 0.5) * 0.05;

      // Starfield Drift
      particles.rotation.y += delta * 0.02;
      particles.position.y = Math.sin(time * 0.3) * 0.2;

      // Damped Camera Parallax
      const targetCamX = Math.sin(time * 0.25) * 0.35 + (mouse.x || 0) * 0.03;
      const targetCamY = 2.8 + Math.cos(time * 0.2) * 0.15 + (-mouse.y || 0) * 0.02;
      camera.position.x += (targetCamX - camera.position.x) * (delta * 3.0);
      camera.position.y += (targetCamY - camera.position.y) * (delta * 3.0);
      camera.lookAt(0, 0.25, 0);

      // Scale subtle 3D tilt
      scaleGroup.rotation.y = (mouse.x || 0) * 0.015;
      scaleGroup.rotation.x = (-mouse.y || 0) * 0.01;

      // Event-driven raycasting
      if (needsRaycastCheck) {
        needsRaycastCheck = false;
        if (mouseVector.x > -900) {
          raycaster.setFromCamera(mouseVector, camera);
          const hovers = raycaster.intersectObjects(interactiveObjects);
          const isHovered = hovers.length > 0;
          container.style.cursor = isHovered ? 'pointer' : 'default';
          brassWeightMaterial.emissiveIntensity = isHovered ? 0.8 : (state === 'VERIFIED' ? 0.6 : 0.35);
        } else {
          container.style.cursor = 'default';
          brassWeightMaterial.emissiveIntensity = state === 'VERIFIED' ? 0.6 : 0.35;
        }
      }

      renderer.render(scene, camera);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animId) cancelAnimationFrame(animId);
      } else {
        clock.getDelta();
        animId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animId = requestAnimationFrame(animate);

    // Throttled Resize Handler
    let resizeTimer = null;
    const handleResize = () => {
      if (resizeTimer) return;
      resizeTimer = setTimeout(() => {
        resizeTimer = null;
        if (!container || !renderer) return;
        width = container.clientWidth || 720;
        height = container.clientHeight || 560;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Complete Cleanup
    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (resizeTimer) clearTimeout(resizeTimer);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      container.removeEventListener('click', handleCanvasClick);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      baseBottomGeo.dispose();
      baseSeamRingGeo.dispose();
      baseUpperGeo.dispose();
      pillarGeo.dispose();
      platterMountGeo.dispose();
      platterDiscGeo.dispose();
      platterRimGeo.dispose();
      gridHelper.geometry.dispose();
      gridHelper.material.dispose();
      weightBodyGeo.dispose();
      weightKnobGeo.dispose();
      weightTopBallGeo.dispose();
      outerRingGeo.dispose();
      middleRingGeo.dispose();
      innerRingGeo.dispose();
      beacon1Geo.dispose();
      beacon2Geo.dispose();
      laserPlaneGeo.dispose();
      particleGeo.dispose();

      darkMetalMaterial.dispose();
      brushedSteelMaterial.dispose();
      glassPlatterMaterial.dispose();
      brassWeightMaterial.dispose();
      mintGlowMaterial.dispose();
      saffronGlowMaterial.dispose();
      outerRingMat.dispose();
      middleRingMat.dispose();
      innerRingMat.dispose();
      laserPlaneMat.dispose();
      particleMat.dispose();

      renderer.dispose();
    };
  }, [onScaleClick]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 4,
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    />
  );
}
