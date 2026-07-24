import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useExperienceStore } from '../stores/experienceStore';

export function EntryGate() {
  const hasEntered = useExperienceStore((s) => s.hasEntered);
  const setEntered = useExperienceStore((s) => s.setEntered);
  const [showTitle, setShowTitle] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Reveal title slowly after particles/stars (conceptual delay)
    const t = setTimeout(() => setShowTitle(true), 3000);
    
    // Heartbeat pulse interval
    const p = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 200);
      setTimeout(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 200);
      }, 400);
    }, 2000); // 1 heartbeat every 2s
    
    return () => {
      clearTimeout(t);
      clearInterval(p);
    };
  }, []);

  return (
    <AnimatePresence>
      {!hasEntered && (
        <motion.div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-[#05060A] text-[#DDD9E0] cursor-pointer"
          onClick={() => setEntered(true)}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 3, ease: 'easeInOut' } }}
        >
          {/* Heartbeat pulse overlay */}
          <motion.div 
            className="absolute inset-0 bg-[#10172B] mix-blend-screen opacity-0"
            animate={{ opacity: pulse ? 0.1 : 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div 
            className="text-center flex flex-col items-center z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showTitle ? 1 : 0, y: showTitle ? 0 : 10 }}
            transition={{ duration: 4, ease: 'easeOut' }}
          >
            <h1 className="font-serif italic font-light text-2xl md:text-4xl tracking-widest leading-relaxed">
              Dura Akasare <br /> Janha Tie
            </h1>
            <div className="mt-12 w-[1px] h-12 bg-gradient-to-b from-[#DDD9E0] to-transparent opacity-30" />
            <p className="mt-8 font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase opacity-50">
              play the song of distance · tap to begin
            </p>
          </motion.div>
          
          {/* Simple CSS particles for loading feel */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#DDD9E0] rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
