import { useRef, useState, useCallback, useEffect } from 'react';

// Pentatonic minor scale in C for emotional space chimes
const SCALE = [
  261.63, // C4
  293.66, // D4
  311.13, // Eb4
  392.00, // G4
  466.16, // Bb4
  523.25, // C5
  587.33, // D5
  622.25, // Eb5
  783.99, // G5
  932.33, // Bb5
  1046.50 // C6
];

export function useSpaceAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  
  // Audio Nodes
  const masterVolumeRef = useRef(null);
  const padVolumeRef = useRef(null);
  const delayNodeRef = useRef(null);
  const padOscillators = useRef([]);
  const lfoNodes = useRef([]);

  // Initialize Audio Context and Nodes
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;

    // 1. Create Context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // 2. Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.4, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterVolumeRef.current = masterGain;

    // 3. Setup Delay / Echo Effect (Crucial for space ambiance)
    const delay = ctx.createDelay(2.0);
    delay.delayTime.setValueAtTime(0.6, ctx.currentTime);
    
    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.5, ctx.currentTime);

    // Filter inside delay loop to make echoes progressively darker (warmer)
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(1000, ctx.currentTime);

    // Connect delay feedback loop
    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay); // Loop back
    
    // Connect delay to master
    delay.connect(masterGain);
    delayNodeRef.current = delay;

    // 4. Setup Space Pad (Deep Ambient Chord)
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0, ctx.currentTime); // Start silent, fade in
    padGain.connect(masterGain);
    padVolumeRef.current = padGain;

    // C minor 9th lush chord: C2, G2, Eb3, Bb3, D4
    const chordFrequencies = [65.41, 98.00, 155.56, 233.08, 293.66];
    
    chordFrequencies.forEach((freq, idx) => {
      // Warm triangle wave for pad
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Low pass filter per oscillator to remove high buzz
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(180 + idx * 40, ctx.currentTime);
      lp.Q.setValueAtTime(1.0, ctx.currentTime);

      // Individual gain for slow volume modulation (LFO breathing)
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.15, ctx.currentTime);

      // LFO to modulate volume slowly
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.08 + idx * 0.02, ctx.currentTime); // Extremely slow: 10-15s per cycle

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.08, ctx.currentTime); // depth of volume breathing

      // Connect LFO
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start();

      // Audio route
      osc.connect(lp);
      lp.connect(oscGain);
      oscGain.connect(padGain);
      
      osc.start();

      // Store references
      padOscillators.current.push(osc);
      lfoNodes.current.push(lfo);
    });

    // Fade in Pad
    padGain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 3.0);
    setIsPlaying(true);
  }, []);

  // Play Star Click Chime
  const playClickChime = useCallback((starIndex) => {
    if (!audioCtxRef.current || isMuted) return;
    const ctx = audioCtxRef.current;
    
    // Select frequency based on star index to guarantee harmonic sounds
    const freq = SCALE[starIndex % SCALE.length];

    // Crystalline Sine Wave + Soft Triangle (FM-like)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const chimeGain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, ctx.currentTime);
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.5, ctx.currentTime); // 5th harmonic for richness

    chimeGain.gain.setValueAtTime(0, ctx.currentTime);
    chimeGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02); // quick attack
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5); // long decay

    // Connect to Master and Delay
    osc1.connect(chimeGain);
    osc2.connect(chimeGain);
    
    chimeGain.connect(masterVolumeRef.current);
    if (delayNodeRef.current) {
      // Connect to delay for epic echoing space chimes
      const delaySend = ctx.createGain();
      delaySend.gain.setValueAtTime(0.2, ctx.currentTime);
      chimeGain.connect(delaySend);
      delaySend.connect(delayNodeRef.current);
    }

    osc1.start();
    osc2.start();

    // Clean up nodes after play
    setTimeout(() => {
      osc1.stop();
      osc2.stop();
      osc1.disconnect();
      osc2.disconnect();
      chimeGain.disconnect();
    }, 3000);
  }, [isMuted]);

  // Play Soft Star Hover Chime
  const playHoverChime = useCallback(() => {
    if (!audioCtxRef.current || isMuted) return;
    const ctx = audioCtxRef.current;

    // Pick a high pentatonic note
    const freq = SCALE[SCALE.length - 2 - Math.floor(Math.random() * 3)];
    
    const osc = ctx.createOscillator();
    const chimeGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Subtle low-pass to make it warm
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, ctx.currentTime);

    chimeGain.gain.setValueAtTime(0, ctx.currentTime);
    chimeGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05); // very soft attack
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8); // fast decay

    osc.connect(filter);
    filter.connect(chimeGain);
    chimeGain.connect(masterVolumeRef.current);

    osc.start();

    setTimeout(() => {
      osc.stop();
      osc.disconnect();
      filter.disconnect();
      chimeGain.disconnect();
    }, 1000);
  }, [isMuted]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    if (!masterVolumeRef.current) return;
    const ctx = audioCtxRef.current;
    
    if (isMuted) {
      masterVolumeRef.current.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.5);
      setIsMuted(false);
    } else {
      masterVolumeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setIsMuted(true);
    }
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        padOscillators.current.forEach(osc => {
          try { osc.stop(); } catch(e){}
        });
        lfoNodes.current.forEach(lfo => {
          try { lfo.stop(); } catch(e){}
        });
        audioCtxRef.current.close();
      }
    };
  }, []);

  return {
    initAudio,
    isPlaying,
    playClickChime,
    playHoverChime,
    isMuted,
    toggleMute
  };
}
