import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar, Bookmark } from 'lucide-react';

export default function MemoryPanel({
  memory,
  onClose,
  onNext,
  onPrev
}) {
  if (!memory) return null;

  return (
    <motion.div
      className="glass-panel interactive"
      style={{
        position: 'absolute',
        right: 'clamp(20px, 5vw, 60px)',
        top: 'clamp(20px, 5vh, 60px)',
        width: 'clamp(320px, 35vw, 460px)',
        maxHeight: 'calc(100vh - 120px)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        color: '#fff',
        border: `1px solid ${memory.color}25`,
        boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.45), 0 0 25px ${memory.color}08`,
      }}
      initial={{ x: 150, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 150, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
    >
      {/* 1. Header Area with Category Tag & Close button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: `${memory.color}15`,
              border: `1px solid ${memory.color}44`,
              color: memory.color,
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Bookmark size={10} />
            {memory.category}
          </span>
        </div>
        
        <motion.button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#fff',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            outline: 'none',
          }}
          whileHover={{ 
            background: 'rgba(255, 75, 139, 0.15)', 
            borderColor: '#ff4b8b', 
            color: '#ff4b8b',
            rotate: 90 
          }}
          whileTap={{ scale: 0.95 }}
        >
          <X size={16} />
        </motion.button>
      </div>

      {/* 2. Scrollable Body Content */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          paddingRight: '6px',
          marginBottom: '20px'
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: '8px',
            letterSpacing: '1px',
            textShadow: `0 0 10px ${memory.color}15`
          }}
        >
          {memory.title}
        </h2>

        {/* Date & Location */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            color: 'var(--text-secondary)',
            fontSize: '0.78rem',
            marginBottom: '20px',
            letterSpacing: '1px'
          }}
        >
          <Calendar size={12} style={{ color: memory.color }} />
          <span>{memory.date}</span>
        </div>

        {/* Image Container */}
        {memory.image && (
          <motion.div
            style={{
              position: 'relative',
              width: '100%',
              height: '180px',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: `0 8px 20px rgba(0, 0, 0, 0.3), 0 0 15px ${memory.color}05`
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <img
              src={memory.image}
              alt={memory.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.95) saturate(1.1)'
              }}
            />
            {/* Soft gradient overlay on image */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, transparent 60%, rgba(2, 2, 8, 0.4) 100%)'
              }}
            />
          </motion.div>
        )}

        {/* Lyrical Content Text */}
        <motion.p
          style={{
            fontSize: '0.92rem',
            lineHeight: 1.8,
            color: 'var(--text-secondary)',
            fontWeight: 300,
            whiteSpace: 'pre-wrap',
            letterSpacing: '0.5px'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {memory.content}
        </motion.p>
      </div>

      {/* 3. Bottom Navigation Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '16px',
        }}
      >
        <motion.button
          onClick={onPrev}
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-header)',
          }}
          whileHover={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderColor: 'rgba(255, 255, 255, 0.2)' 
          }}
          whileTap={{ scale: 0.97 }}
        >
          <ChevronLeft size={14} />
          Previo
        </motion.button>

        <motion.button
          onClick={onNext}
          style={{
            background: `${memory.color}12`,
            border: `1px solid ${memory.color}25`,
            color: '#fff',
            padding: '8px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-header)',
          }}
          whileHover={{ 
            background: `${memory.color}22`, 
            borderColor: memory.color,
            boxShadow: `0 0 10px ${memory.color}15`
          }}
          whileTap={{ scale: 0.97 }}
        >
          Sig.
          <ChevronRight size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
}
