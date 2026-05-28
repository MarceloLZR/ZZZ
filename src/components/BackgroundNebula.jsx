import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Custom GLSL Shader for the warp procedural Nebula
const NebulaShader = {
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1000, 1000) },
    uColorBase: { value: new THREE.Color('#02020a') },
    uColorPurple: { value: new THREE.Color('#3b085c') },
    uColorCian: { value: new THREE.Color('#033b5c') },
    uColorMagenta: { value: new THREE.Color('#5c0338') }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorBase;
    uniform vec3 uColorPurple;
    uniform vec3 uColorCian;
    uniform vec3 vColorMagenta; // Note: let's define colors inside the shader or map them
    
    varying vec2 vUv;
    varying vec3 vNormal;

    // Pseudo-random noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    // 2D Noise
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    // Fractional Brownian Motion (fbm)
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      // Rotate to reduce axial bias
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 4; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // Scale coordinates on the giant sphere
      vec2 p = vUv * 6.0;
      
      // Domain Warping! (Twisting, organic gas clouds)
      // Slow shift over time
      vec2 q = vec2(
        fbm(p + vec2(0.0, 0.0) + uTime * 0.015),
        fbm(p + vec2(5.2, 1.3) + uTime * 0.01)
      );
      
      vec2 r = vec2(
        fbm(p + 3.0 * q + vec2(8.3, 2.8) - uTime * 0.008),
        fbm(p + 3.0 * q + vec2(2.1, 6.5) + uTime * 0.012)
      );
      
      // Final gas density
      float gas = fbm(p + 3.5 * r);
      
      // Glow on the horizon (Fresnel effect to blend background nicely)
      float horizon = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
      horizon = pow(horizon, 3.0) * 0.4;

      // Color maps
      vec3 colorBase = uColorBase;
      vec3 colorPurple = vec3(0.12, 0.03, 0.22); // Warm Deep Purple
      vec3 colorCian = vec3(0.01, 0.08, 0.2);     // Cosmic Cyan/Blue
      vec3 colorMagenta = vec3(0.2, 0.02, 0.12);  // Stars glow magenta
      
      // Blend colors based on noise regions
      vec3 finalColor = colorBase;
      finalColor = mix(finalColor, colorCian, smoothstep(0.15, 0.7, gas));
      finalColor = mix(finalColor, colorPurple, smoothstep(0.35, 0.85, gas * q.x));
      finalColor = mix(finalColor, colorMagenta, smoothstep(0.5, 0.95, gas * r.y));
      
      // Add neon stars glow overlay (small high frequency dots)
      float stars = pow(noise(vUv * 150.0), 32.0) * 0.25;
      finalColor += vec3(stars * 1.5);
      
      // Add subtle horizon fading
      finalColor += vec3(horizon * 0.2, horizon * 0.1, horizon * 0.35);

      // Vignette effect to focus the view center
      float dist = length(vUv - vec2(0.5));
      finalColor *= 1.0 - dist * 0.4;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

export default function BackgroundNebula() {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      // Update time uniform for procedural fluid movement
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
    if (meshRef.current) {
      // Extremely slow rotation of the skybox for dynamic depth parallax
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.0008;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.0004;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/* A giant sphere inside which the whole scene is rendered */}
      <sphereGeometry args={[140, 48, 48]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={NebulaShader.vertexShader}
        fragmentShader={NebulaShader.fragmentShader}
        uniforms={THREE.UniformsUtils.clone(NebulaShader.uniforms)}
        side={THREE.BackSide}
        depthWrite={false} // Renders behind everything
      />
    </mesh>
  );
}
