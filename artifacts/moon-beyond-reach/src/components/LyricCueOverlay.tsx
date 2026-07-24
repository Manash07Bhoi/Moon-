import { useTimelineStore } from '../stores/timelineStore';
import { motion, AnimatePresence } from 'motion/react';

export function LyricCueOverlay() {
  const activeLine = useTimelineStore((s) => s.activeLine);
  const activeCue = useTimelineStore((s) => s.activeCue);

  // Derive animation based on cue type
  const getAnimationProps = (cue: string | null) => {
    switch (cue) {
      case 'constellation-form':
        return {
          initial: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
          animate: { opacity: 0.6, scale: 1, filter: 'blur(0px)' },
          exit: { opacity: 0, scale: 1.1, filter: 'blur(10px)' },
          transition: { duration: 3, ease: 'easeInOut' }
        };
      case 'aurora-write':
        return {
          initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
          animate: { opacity: 0.5, y: 0, filter: 'blur(1px)' },
          exit: { opacity: 0, y: -20, filter: 'blur(8px)' },
          transition: { duration: 4, ease: 'easeOut' }
        };
      case 'moon-beam-write':
        return {
          initial: { opacity: 0, x: -50, filter: 'blur(8px)' },
          animate: { opacity: 0.7, x: 0, filter: 'blur(0px)' },
          exit: { opacity: 0, x: 50, filter: 'blur(8px)' },
          transition: { duration: 3.5, ease: 'easeInOut' }
        };
      case 'rain-ripple-reveal':
      case 'lake-reflection-reveal':
        return {
          initial: { opacity: 0, scaleY: -1, filter: 'blur(5px)' }, // reflected look
          animate: { opacity: 0.4, scaleY: -1, filter: 'blur(1px)' },
          exit: { opacity: 0, filter: 'blur(10px)' },
          transition: { duration: 4, ease: 'easeInOut' }
        };
      default:
        // Default gentle fade
        return {
          initial: { opacity: 0, filter: 'blur(10px)' },
          animate: { opacity: 0.5, filter: 'blur(2px)' },
          exit: { opacity: 0, filter: 'blur(10px)' },
          transition: { duration: 4, ease: 'easeInOut' }
        };
    }
  };

  const anim = getAnimationProps(activeCue);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {activeLine && (
          <motion.div
            key={activeLine}
            initial={anim.initial}
            animate={anim.animate}
            exit={anim.exit}
            transition={anim.transition}
            className="absolute text-center"
            style={{
              // Position based on cue kind of roughly maps to where it happens
              top: activeCue?.includes('lake') || activeCue?.includes('rain') ? '70%' : '30%',
            }}
          >
            <p className="font-mono text-xs md:text-sm tracking-[0.5em] text-[#DDD9E0] uppercase opacity-60 mix-blend-screen">
              {activeLine}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hidden text for screen readers */}
      <p aria-live="polite" className="sr-only">
        {activeLine}
      </p>
    </div>
  );
}
