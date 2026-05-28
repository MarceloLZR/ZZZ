import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';

import WelcomeScreen from './components/UI/WelcomeScreen';
import MemoryPanel from './components/UI/MemoryPanel';
import AudioToggle from './components/UI/AudioToggle';
import SpaceScene from './components/SpaceScene';

import { memories } from './data/memories';
import { useSpaceAudio } from './hooks/useSpaceAudio';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [activeStarId, setActiveStarId] = useState(null);

  // Custom procedural space audio synthesizer hook
  const {
    initAudio,
    playClickChime,
    playHoverChime,
    isMuted,
    toggleMute
  } = useSpaceAudio();

  // Find currently active memory
  const activeMemory = memories.find((m) => m.id === activeStarId);
  const activeIndex = memories.findIndex((m) => m.id === activeStarId);

  // Transition into the universe & start generative audio
  const handleEnter = () => {
    initAudio();
    setHasEntered(true);
  };

  // Select a star: Play FM chime and set camera focus target
  const handleSelectStar = (memory) => {
    const idx = memories.findIndex((m) => m.id === memory.id);
    playClickChime(idx);
    setActiveStarId(memory.id);
  };

  // Close the detail panel: Camera returns to free float
  const handleClosePanel = () => {
    setActiveStarId(null);
  };

  // Navigate to Next Star (Seamless cinematic transit)
  const handleNextStar = () => {
    if (activeIndex === -1) return;
    const nextIdx = (activeIndex + 1) % memories.length;
    const nextMem = memories[nextIdx];
    playClickChime(nextIdx);
    setActiveStarId(nextMem.id);
  };

  // Navigate to Previous Star
  const handlePrevStar = () => {
    if (activeIndex === -1) return;
    const prevIdx = (activeIndex - 1 + memories.length) % memories.length;
    const prevMem = memories[prevIdx];
    playClickChime(prevIdx);
    setActiveStarId(prevMem.id);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#020208' }}>
      
      {/* 1. Cinematic Welcome Screen Portal */}
      <AnimatePresence>
        {!hasEntered && (
          <WelcomeScreen onEnter={handleEnter} />
        )}
      </AnimatePresence>

      {/* 2. Brand Luxury Top Overlay */}
      {hasEntered && (
        <motion.div
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(255, 255, 255, 0.75)',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-header)',
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
        >
          <Heart size={14} fill="var(--accent-magenta)" style={{ color: 'var(--accent-magenta)' }} />
          <span>Tú eres mi universo</span>
          <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>|</span>
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>Feliz Cumpleaños</span>
        </motion.div>
      )}

      {/* 3. 3D Space Canvas Rendering */}
      {hasEntered && (
        <div style={{ width: '100%', height: '100%', zIndex: 1, position: 'absolute' }}>
          <Canvas
            gl={{ 
              antialias: true, 
              powerPreference: 'high-performance',
              alpha: false
            }}
            camera={{ 
              fov: 60, 
              near: 0.1, 
              far: 250 
            }}
          >
            <color attach="background" args={['#020208']} />
            
            <SpaceScene
              memories={memories}
              activeStarId={activeStarId}
              setActiveStarId={setActiveStarId}
              onHoverStar={playHoverChime}
              onClickStar={handleSelectStar}
            />
          </Canvas>
        </div>
      )}

      {/* 4. Translucent Interactive Glassmorphic UI Panel */}
      <AnimatePresence>
        {hasEntered && activeStarId && (
          <MemoryPanel
            key="details-panel"
            memory={activeMemory}
            onClose={handleClosePanel}
            onNext={handleNextStar}
            onPrev={handlePrevStar}
          />
        )}
      </AnimatePresence>

      {/* 5. Procedural Synthesizer Soundtrack Toggle */}
      {hasEntered && (
        <AudioToggle
          isMuted={isMuted}
          onToggle={toggleMute}
        />
      )}

      {/* Dynamic Background Glow Rings for Premium UI */}
      {hasEntered && (
        <>
          <div className="bg-glow glow-purple" />
          <div className="bg-glow glow-blue" />
        </>
      )}
    </div>
  );
}
