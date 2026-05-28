import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AudioToggle({ isMuted, onToggle }) {
  return (
    <motion.button
      className="interactive"
      onClick={onToggle}
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        zIndex: 60,
        background: 'rgba(5, 5, 15, 0.45)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#fff',
        outline: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
      }}
      whileHover={{ 
        scale: 1.08,
        borderColor: 'var(--accent-cyan)',
        boxShadow: '0 0 15px rgba(0, 243, 255, 0.3)'
      }}
      whileTap={{ scale: 0.95 }}
    >
      {isMuted ? <VolumeX size={18} style={{ color: '#ff4b8b' }} /> : <Volume2 size={18} style={{ color: 'var(--accent-cyan)' }} />}
    </motion.button>
  );
}
