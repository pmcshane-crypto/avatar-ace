import { motion } from 'framer-motion';

export default function Confetti() {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  
  const confettiPieces = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {confettiPieces.map(piece => (
        <motion.div
          key={piece.id}
          initial={{ 
            y: -20, 
            x: `${piece.x}%`, 
            opacity: 1,
            rotate: 0,
            scale: 0
          }}
          animate={{ 
            y: '100%', 
            opacity: [1, 1, 0],
            rotate: piece.rotation + 360,
            scale: [0, 1, 0.5]
          }}
          transition={{ 
            duration: piece.duration, 
            delay: piece.delay,
            ease: 'easeOut'
          }}
          style={{
            position: 'absolute',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}
