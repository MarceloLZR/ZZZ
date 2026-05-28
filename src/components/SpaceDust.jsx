import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SpaceDust({ count = 1500 }) {
  const pointsRef = useRef();

  // Create random positions and random drift factors for each dust particle
  const [positions, driftFactors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const drifts = new Float32Array(count);
    
    // Spread particles in a large spherical shell around the center [0,0,0]
    for (let i = 0; i < count; i++) {
      // Spherical coordinate distribution
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = Math.acos(THREE.MathUtils.randFloat(-1, 1));
      const distance = THREE.MathUtils.randFloat(8, 75); // disperse between 8 and 75 units

      pos[i * 3] = distance * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = distance * Math.cos(phi);

      // Unique drift velocity/phase
      drifts[i] = THREE.MathUtils.randFloat(0.1, 1.5);
    }
    
    return [pos, drifts];
  }, [count]);

  // Create a canvas texture dynamically to render circular particles (soft glows)
  const circularTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Radial gradient: white in the center, transparent at the edges
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime();
      
      // 1. Slow, organic rotation of the entire particle cloud
      pointsRef.current.rotation.y = time * 0.005;
      pointsRef.current.rotation.z = time * 0.002;
      
      // 2. Slow bobbing movement (up & down) to feel underwater/in space
      pointsRef.current.position.y = Math.sin(time * 0.15) * 0.5;
      pointsRef.current.position.x = Math.cos(time * 0.1) * 0.3;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        color="#cdeeff"
        transparent={true}
        opacity={0.65}
        map={circularTexture}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
}
