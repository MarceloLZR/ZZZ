import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

// Custom Fresnel Glow Shader for the star corona
const GlowShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uGlowIntensity;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      // Fresnel effect: dot product of view vector and surface normal
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      float intensity = 1.0 - max(0.0, dot(normal, viewDir));
      // Curve the intensity to create a soft outer rim glow
      float glow = pow(intensity, 4.0) * uGlowIntensity;
      
      gl_FragColor = vec4(uColor, glow);
    }
  `
};

export default function MemoryStar({
  memory,
  index,
  isActive,
  isAnyActive,
  onClick,
  onHover
}) {
  const starRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Random phases for organic, unique floating motions
  const randomSpeed = 1.0 + (index % 3) * 0.25;
  const randomPhase = index * 2.0;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (starRef.current) {
      // 1. Slow, majestic rotation
      starRef.current.rotation.y = time * 0.2 * randomSpeed;
      starRef.current.rotation.x = time * 0.08;

      // 2. Slow organic bobbing (sine wave)
      const bobbing = Math.sin(time * 0.6 * randomSpeed + randomPhase) * 0.15;
      
      // Update position slowly
      starRef.current.position.y = memory.position[1] + bobbing;
      starRef.current.position.x = memory.position[0] + Math.cos(time * 0.3 + randomPhase) * 0.08;
    }

    // 3. Modulate glow intensity for a dynamic pulsating/twinkling star effect
    if (glowRef.current) {
      const pulseSpeed = hovered ? 4.0 : 1.5;
      const pulseDepth = hovered ? 0.3 : 0.15;
      const baseIntensity = hovered ? 2.2 : 1.2;
      
      glowRef.current.uniforms.uGlowIntensity.value = 
        baseIntensity + Math.sin(time * pulseSpeed + randomPhase) * pulseDepth;
    }
  });

  // Calculate dynamic scale
  let targetScale = 1.0;
  if (isActive) {
    targetScale = 1.35; // Expands when selected
  } else if (hovered) {
    targetScale = 1.25; // Expands on hover
  } else if (isAnyActive) {
    targetScale = 0.55;  // Fades/shrinks if another star is active (cinematic focus)
  }

  // Linear interpolation (lerp) of scale for smooth transitions
  useFrame(() => {
    if (starRef.current) {
      const currentScale = starRef.current.scale.x;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
      starRef.current.scale.set(nextScale, nextScale, nextScale);
    }
  });

  return (
    <group 
      ref={starRef} 
      position={[memory.position[0], memory.position[1], memory.position[2]]}
    >
      {/* A. Inner Core (High emissive sphere) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(); // plays space hover chime
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color={memory.color}
          emissive={memory.color}
          emissiveIntensity={hovered ? 6.0 : 2.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* B. Outer Halo (Custom Glow Fresnel Shader) */}
      <mesh scale={[1.7, 1.7, 1.7]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <shaderMaterial
          ref={glowRef}
          vertexShader={GlowShader.vertexShader}
          fragmentShader={GlowShader.fragmentShader}
          uniforms={{
            uColor: { value: new THREE.Color(memory.color) },
            uGlowIntensity: { value: 1.2 }
          }}
          transparent={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* C. Orbits / Stellar Dust particles around this star */}
      {hovered && (
        <group>
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 0.55;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * distance, 0, Math.sin(angle) * distance]}
              >
                <sphereGeometry args={[0.015, 8, 8]} />
                <meshBasicMaterial color={memory.color} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* D. HTML Screen Tag (Subtle title overlay when hovered/selected) */}
      {(hovered || isActive) && (
        <Html
          distanceFactor={6}
          position={[0, 0.45, 0]}
          center
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          <div
            style={{
              background: 'rgba(5, 5, 15, 0.85)',
              border: `1px solid ${memory.color}44`,
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontFamily: 'var(--font-header)',
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              boxShadow: `0 0 10px ${memory.color}22`,
              animation: 'fadeIn 0.2s ease-out forwards',
              opacity: 0.95
            }}
          >
            {memory.title}
          </div>
        </Html>
      )}
    </group>
  );
}
