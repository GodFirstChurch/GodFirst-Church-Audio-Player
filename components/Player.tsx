import React, { useRef, useEffect } from 'react';
import { Sermon } from '../types';
import { PlayIcon, PauseIcon } from './Icons';

interface PlayerProps {
  currentSermon: Sermon | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onEnded: () => void;
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const Player: React.FC<PlayerProps> = ({ 
  currentSermon, 
  isPlaying, 
  onPlayPause, 
  onTimeUpdate,
  onEnded 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  useEffect(() => {
    if (currentSermon && audioRef.current) {
      // If the source changed, load it
      if (audioRef.current.src !== currentSermon.audioUrl) {
         audioRef.current.src = currentSermon.audioUrl;
         audioRef.current.play().then(() => {
           if (!isPlaying) onPlayPause(); // Ensure state sync
         }).catch(e => console.error("Playback error:", e));
      } else {
        // Just toggling play/pause on same track
        if (isPlaying) {
          audioRef.current.play().catch(e => console.error(e));
        } else {
          audioRef.current.pause();
        }
      }
    }
  }, [currentSermon, isPlaying, onPlayPause]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const curr = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(curr);
      setDuration(dur);
      setProgress((curr / dur) * 100);
      onTimeUpdate(curr, dur);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekTime = (Number(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(Number(e.target.value));
    }
  };

  if (!currentSermon) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 pb-safe">
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
      />
      <div className="max-w-4xl mx-auto p-4 flex flex-col gap-2">
        {/* Progress Bar */}
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium font-mono">
          <span>{formatTime(currentTime)}</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress || 0} 
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-600"
          />
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls & Info */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex-1 pr-4 min-w-0">
            <h4 className="font-semibold text-slate-900 truncate text-sm brand-font tracking-wide">{currentSermon.title}</h4>
            <p className="text-xs text-slate-500 truncate uppercase tracking-wider">{currentSermon.preacher}</p>
          </div>

          <button 
            onClick={onPlayPause}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-sky-500 text-white shadow-md hover:bg-sky-600 hover:scale-105 transition-all active:scale-95 border-2 border-transparent hover:border-amber-400"
          >
            {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player;