import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import BackgroundNebula from './BackgroundNebula';
import SpaceDust from './SpaceDust';
import MemoryStar from './MemoryStar';
import CameraController from './CameraController';
import BlackHole from './BlackHole';

export default function SpaceScene({
  memories,
  activeStarId,
  setActiveStarId,
  onHoverStar,
  onClickStar
}) {
  return (
    <>
      {/* 1. Cinematic Background Nebula */}
      <BackgroundNebula />

      {/* 2. Ambient Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={0.8} 
        color="#00f3ff" 
      />
      <pointLight 
        position={[-15, -20, -10]} 
        intensity={0.6} 
        color="#ff4b8b" // Romantic warm pink spotlight glow in the background
      />

      {/* 3. Central Interstellar Gargantua-style Black Hole */}
      {/* Represents the center of gravity: "Tú eres mi universo" */}
      <BlackHole radius={1.6} />

      {/* 4. Space Dust (Instanced Particles) */}
      <SpaceDust count={1500} />

      {/* 5. Interactive Memory Stars orbiting around the central Black Hole */}
      {memories.map((memory, index) => {
        const isActive = activeStarId === memory.id;
        return (
          <MemoryStar
            key={memory.id}
            memory={memory}
            index={index}
            isActive={isActive}
            isAnyActive={activeStarId !== null}
            onClick={() => {
              onClickStar(memory);
            }}
            onHover={onHoverStar}
          />
        );
      })}

      {/* 6. Smooth Camera Controller (Handles floating & cinematic zoom-to-star) */}
      <CameraController 
        activeStarId={activeStarId} 
        memories={memories} 
      />

      {/* 7. Cinematic Post-Processing Effects (Epic bloom glows & movie vignetting) */}
      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={0.12} // Lower threshold so accretion disk and white stars glow deslumbrantemente
          luminanceSmoothing={0.85}
          intensity={2.2}          // Lush stellar glow intensity
          mipmapBlur
        />
        <Vignette 
          offset={0.25} 
          darkness={1.2} 
          eskil={false} 
        />
      </EffectComposer>
    </>
  );
}
