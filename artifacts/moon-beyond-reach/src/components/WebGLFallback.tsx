/**
 * Shown when WebGL is unavailable (headless Chrome, GPU-less servers,
 * browsers with hardware-acceleration disabled, etc.).
 * Pure CSS — no Three.js dependency.
 */
export function WebGLFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#05060A] overflow-hidden">
      {/* Simulated moon glow */}
      <div
        className="absolute rounded-full bg-[#DDD9E0] opacity-[0.06] blur-3xl"
        style={{ width: 320, height: 320, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />
      <div
        className="absolute rounded-full bg-[#DDD9E0] opacity-[0.03]"
        style={{ width: 120, height: 120, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />

      {/* Content */}
      <div className="relative text-center space-y-8 text-[#DDD9E0] z-10 px-8">
        <h1 className="font-serif italic font-light text-3xl md:text-5xl tracking-widest leading-relaxed opacity-70">
          Dura Akasare <br /> Janha Tie
        </h1>

        <div className="w-[1px] h-12 bg-gradient-to-b from-[#DDD9E0] to-transparent opacity-20 mx-auto" />

        <p className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-30 max-w-xs mx-auto">
          This experience requires WebGL. Enable hardware acceleration in your browser settings to continue.
        </p>
      </div>
    </div>
  );
}
