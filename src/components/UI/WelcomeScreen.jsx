import React from 'react';
import { motion } from 'framer-motion';
import { Headphones, Sparkles, Heart } from 'lucide-react';

export default function WelcomeScreen({ onEnter }) {
  return (
    <motion.div
      className="interactive"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #0a0518 0%, #010105 100%)',
        padding: '20px',
        textAlign: 'center',
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.8, ease: 'easeInOut' } }}
    >
      {/* Background Soft Pink/Cyan Space Glows */}
      <div className="bg-glow glow-purple" style={{ opacity: 0.35, width: '450px', height: '450px', background: 'var(--accent-magenta)' }} />
      <div className="bg-glow glow-blue" style={{ opacity: 0.25, width: '450px', height: '450px', background: 'var(--accent-cyan)' }} />

      {/* Decorative Star Particles */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.45 }}>
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 3 + 1.5 + 'px',
              height: Math.random() * 3 + 1.5 + 'px',
              background: i % 2 === 0 ? '#ffc2eb' : '#ffffff',
              borderRadius: '50%',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              opacity: [0.1, 0.9, 0.1],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 2.5 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Content Container */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ maxWidth: '620px', zIndex: 10 }}
      >
        <motion.div
          animate={{ scale: [0.97, 1.03, 0.97] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ marginBottom: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-magenta)' }}
        >
          <Heart size={14} fill="var(--accent-magenta)" />
          <span style={{ fontSize: '0.78rem', letterSpacing: '4px', textTransform: 'uppercase', fontFamily: 'var(--font-header)', fontWeight: 600 }}>
            Una dedicatoria espacial para ti
          </span>
        </motion.div>

        <h1
          className="text-gradient"
          style={{
            fontSize: 'clamp(2.2rem, 6.5vw, 3.8rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            margin: '10px 0 25px',
            fontFamily: 'var(--font-header)',
            letterSpacing: '8px',
            lineHeight: 1.15,
            background: 'linear-gradient(135deg, #fff 20%, #ffc2eb 60%, var(--accent-magenta) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Tú eres mi universo
        </h1>

        <p
          style={{
            fontSize: 'clamp(0.9rem, 2.2vw, 1.08rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.9,
            marginBottom: '44px',
            fontWeight: 300,
            letterSpacing: '1px',
            padding: '0 25px',
          }}
        >
          Bienvenida al centro de mi universo.He creado este espacio interactivo para celebrar tu día especial. Cada estrella blanca que brilla en esta galaxia guarda una carta, un recuerdo y un pedacito de todo lo que quiero decirte.Feliz cumpleaños, mi patito. ✨

        </p>

        {/* Enter Button with Pulse Glow */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '44px' }}>
          <motion.button
            className="glass-button pulse-border"
            onClick={onEnter}
            style={{
              padding: '18px 45px',
              fontSize: '0.9rem',
              borderRadius: '35px',
              borderColor: 'rgba(255, 75, 139, 0.4)',
              boxShadow: '0 0 25px rgba(255, 75, 139, 0.15)',
              background: 'rgba(255, 75, 139, 0.05)',
            }}
            whileHover={{ 
              scale: 1.06,
              borderColor: 'var(--accent-magenta)',
              boxShadow: '0 0 35px rgba(255, 75, 139, 0.45)',
              background: 'rgba(255, 75, 139, 0.15)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            Entrar a mi Universo
          </motion.button>
        </div>

        {/* UX Tips */}
        <motion.div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            color: 'rgba(255, 255, 255, 0.35)',
            fontSize: '0.75rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Headphones size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Colócate auriculares para escuchar la sinfonía</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={14} style={{ color: 'var(--accent-magenta)' }} />
            <span>Explora las estrellas que orbitan al centro</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
