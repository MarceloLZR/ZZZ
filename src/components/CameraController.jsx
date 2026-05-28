import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraController({ activeStarId, memories }) {
  const { camera } = useThree();
  
  // Keep track of the current looking target vector
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const targetPos = useRef(new THREE.Vector3(0, 0, 12));

  // Initialize camera position
  useEffect(() => {
    camera.position.set(0, 0, 20);
  }, [camera]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const activeStar = memories.find(m => m.id === activeStarId);

    if (!activeStar) {
      // 1. FREE MODE: Slow, floating space orbit camera with mouse parallax
      
      // Calculate float trajectory based on time
      const floatX = Math.sin(time * 0.08) * 1.8;
      const floatY = Math.cos(time * 0.05) * 1.2;
      const floatZ = 12.0 + Math.sin(time * 0.03) * 1.5;

      // Add mouse cursor coordinates (parallax)
      const mouseParallaxX = state.pointer.x * 2.2;
      const mouseParallaxY = state.pointer.y * 1.6;

      targetPos.current.set(
        floatX + mouseParallaxX,
        floatY + mouseParallaxY,
        floatZ
      );

      // Camera slowly looks around near the center, responding to mouse
      targetLookAt.current.set(
        mouseParallaxX * 0.4,
        mouseParallaxY * 0.3,
        0
      );
    } else {
      // 2. FOCUS MODE: Cinematic fly-by zoom focusing on the star
      const starPos = new THREE.Vector3(...activeStar.position);
      
      // Calculate a beautiful cinematic framing position
      // Star is positioned on the left side of the screen
      // We position the camera offset: leftwards, slightly above, and in front of the star.
      targetPos.current.set(
        starPos.x - 1.5,
        starPos.y + 0.4,
        starPos.z + 2.8
      );

      // The camera target is slightly to the right of the star,
      // shifting the actual star mesh to the left part of the viewport.
      targetLookAt.current.set(
        starPos.x + 0.5,
        starPos.y,
        starPos.z
      );
    }

    // 3. Smoothly interpolate position (lerp)
    camera.position.lerp(targetPos.current, 0.055); // smooth elastic follow

    // 4. Smoothly interpolate lookAt (lerp) and apply
    currentLookAt.current.lerp(targetLookAt.current, 0.055);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
