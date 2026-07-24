import { Volume2, VolumeX } from 'lucide-react';
import { useAudioStore } from '../stores/audioStore';

export function MuteControl() {
  const volume = useAudioStore((s) => s.volume);
  const setVolume = useAudioStore((s) => s.setVolume);

  return (
    <div className="absolute bottom-6 right-6 z-40">
      <button 
        onClick={() => setVolume(volume === 0 ? 1 : 0)}
        className="text-[#DDD9E0] opacity-30 hover:opacity-100 transition-opacity duration-700 ease-in-out cursor-pointer p-2"
        aria-label="Toggle mute"
      >
        {volume === 0 ? (
          <VolumeX size={16} strokeWidth={1} />
        ) : (
          <Volume2 size={16} strokeWidth={1} />
        )}
      </button>
    </div>
  );
}
