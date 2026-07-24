import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useExperienceStore } from '../stores/experienceStore';

// Particle positions computed once — Math.random() in JSX re-rolls every render
const PARTICLE_COUNT = 20;
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 5,
}));

export function EntryGate() {
  const hasEntered = useExperienceStore((s) => s.hasEntered);
  const setEntered = useExperienceStore((s) => s.setEntered);
  const [showTitle, setShowTitle] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowTitle(true), 3000);

    const p = setInterval(() => {
      setPulse(true);
      const t1 = setTimeout(() => setPulse(false), 200);
      const t2 = setTimeout(() => {
        setPulse(true);
        const t3 = setTimeout(() => setPulse(false), 200);
        return () => clearTimeout(t3);
      }, 400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }, 2000);

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

          {/* CSS particles — memoized positions, not re-rolled on re-render */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute w-1 h-1 bg-[#DDD9E0] rounded-full"
                style={{ left: p.left, top: p.top }}
                animate={{ y: [0, -20, 0], opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
