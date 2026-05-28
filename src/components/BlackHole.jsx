import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Custom Accretion Disk Shader for Interstellar Gargantua-style Black Hole
const AccretionDiskShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vPosition;

    // Simplex-like 2D noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    void main() {
      // Convert to polar coordinates
      vec2 center = vUv - vec2(0.5);
      float dist = length(center) * 2.0; // Normalized radius [0, 1.4]
      float angle = atan(center.y, center.x);

      // We only render in the accretion ring band
      if (dist < 0.22 || dist > 0.98) {
        discard;
      }

      // Dynamic spiraling noise
      float spiralSpeed = uTime * 1.8;
      float noiseVal = noise(vec2(dist * 12.0, angle * 5.0 - spiralSpeed + dist * 6.0));
      float noiseVal2 = noise(vec2(dist * 6.0, angle * 3.0 + spiralSpeed * 0.5));
      
      // Combine noises
      float gasDensity = mix(noiseVal, noiseVal2, 0.4);
      
      // Calculate glow intensity based on radius (brightest at inner edge, fading outwards)
      float innerGlow = smoothstep(0.22, 0.32, dist);
      float outerFade = 1.0 - smoothstep(0.4, 0.98, dist);
      float baseGlow = innerGlow * outerFade;
      
      // Accumulate glow and gas filaments
      float intensity = baseGlow * (0.65 + gasDensity * 0.55);

      // Color maps (Amber, Pink, Purple for a romantic cosmic look)
      vec3 innerColor = vec3(1.0, 0.85, 0.4); // Bright warm yellow/gold at center
      vec3 middleColor = vec3(1.0, 0.22, 0.65); // Romantic pink/magenta in middle
      vec3 outerColor = vec3(0.5, 0.1, 0.9);   // Deep space violet at edges

      vec3 finalColor = mix(innerColor, middleColor, smoothstep(0.25, 0.55, dist));
      finalColor = mix(finalColor, outerColor, smoothstep(0.5, 0.9, dist));
      
      // Apply intensity
      finalColor *= intensity * 1.8;

      // Soft opacity falloff at the outer edges
      float alpha = baseGlow * (0.8 + gasDensity * 0.2);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

export default function BlackHole({ radius = 1.4 }) {
  const diskRef = useRef();
  const diskMaterialRef = useRef();
  const particleGroupRef = useRef();

  // Create a system of 500 stardust particles orbiting in a disk around the black hole
  const pCount = 500;
  const [positions, phases, speeds] = useMemo(() => {
    const pos = new Float32Array(pCount * 3);
    const phs = new Float32Array(pCount);
    const spd = new Float32Array(pCount);

    for (let i = 0; i < pCount; i++) {
      // Orbit radius (disposed in accretion band)
      const r = THREE.MathUtils.randFloat(1.1, 4.0);
      const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
      
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = THREE.MathUtils.randFloat(-0.06, 0.06); // very thin disk
      pos[i * 3 + 2] = Math.sin(angle) * r;

      phs[i] = angle;
      spd[i] = THREE.MathUtils.randFloat(0.4, 1.2) / r; // speed inversely proportional to distance (Keplerian)
    }

    return [pos, phs, spd];
  }, []);

  // Simple particle texture
  const softParticleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 180, 220, 0.8)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (diskMaterialRef.current) {
      diskMaterialRef.current.uniforms.uTime.value = time;
    }

    if (diskRef.current) {
      // Slow rotation and slight tilt oscilation for a dynamic 3D look
      diskRef.current.rotation.z = -time * 0.15;
    }

    // Animate stardust particles around the horizon
    if (particleGroupRef.current) {
      const geo = particleGroupRef.current.geometry;
      const posAttr = geo.attributes.position;

      for (let i = 0; i < pCount; i++) {
        // Update angle based on orbital speed
        phases[i] += speeds[i] * 0.015;
        const r = Math.sqrt(
          posAttr.getX(i) * posAttr.getX(i) + posAttr.getZ(i) * posAttr.getZ(i)
        );

        posAttr.setX(i, Math.cos(phases[i]) * r);
        posAttr.setZ(i, Math.sin(phases[i]) * r);
        
        // Add subtle wave fluctuation to disk particles
        posAttr.setY(i, Math.sin(time * 0.8 + phases[i] * 4.0) * 0.04);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      
      {/* 1. Event Horizon: The pitch black central sphere representing the gravitational center */}
      <mesh>
        <sphereGeometry args={[radius * 0.55, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 2. Accretion Disk (Visual glowing gas disk spinning around the singularity) */}
      {/* Tilted slightly in x-axis to look exactly like the cinematic Interstellar representation */}
      <mesh 
        ref={diskRef} 
        rotation={[-Math.PI / 2.3, 0.1, 0]}
        scale={[1.1, 1.1, 1.1]}
      >
        <planeGeometry args={[10, 10]} />
        <shaderMaterial
          ref={diskMaterialRef}
          vertexShader={AccretionDiskShader.vertexShader}
          fragmentShader={AccretionDiskShader.fragmentShader}
          uniforms={{
            uTime: { value: 0 }
          }}
          transparent={true}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Orbiting Accretion Stardust (Twinkling particles orbiting Gargantua) */}
      <points 
        ref={particleGroupRef}
        rotation={[-Math.PI / 2.3, 0.1, 0]}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#ffb3d9"
          transparent={true}
          opacity={0.7}
          map={softParticleTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>

      {/* 4. Gravitational Lens Glow: A soft transparent sphere around the event horizon */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[radius * 0.55, 32, 32]} />
        <meshBasicMaterial
          color="#ffd6eb"
          transparent={true}
          opacity={0.065}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
