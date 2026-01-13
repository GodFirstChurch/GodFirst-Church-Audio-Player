import React, { useRef, useEffect, useState } from 'react';
import { Sermon } from '../types';
import { PlayIcon, PauseIcon, RewindIcon, ForwardIcon, DownloadIcon } from './Icons';

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
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (currentSermon && audioRef.current) {
      // If the source changed, load it
      if (audioRef.current.src !== currentSermon.audioUrl) {
         audioRef.current.src = currentSermon.audioUrl;
         audioRef.current.playbackRate = playbackRate;
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

  // Handle Playback Rate Changes separately to avoid reloading src
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

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

  const skipTime = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += amount;
    }
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIndex]);
  };

  if (!currentSermon) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 pb-safe">
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
      />
      <div className="max-w-4xl mx-auto p-4 flex flex-col gap-3">
        {/* Progress Bar Row */}
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium font-mono">
          <span className="w-8 text-right">{formatTime(currentTime)}</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress || 0} 
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <span className="w-8">{formatTime(duration)}</span>
        </div>

        {/* Controls & Info Row */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Track Info (Hidden on very small screens if needed, but flex handles it) */}
          <div className="hidden sm:block flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 truncate text-sm brand-font tracking-wide">{currentSermon.title}</h4>
            <p className="text-xs text-slate-500 truncate uppercase tracking-wider">{currentSermon.preacher}</p>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-4 flex-1 justify-center sm:justify-end">
             
             {/* Speed Toggle */}
             <button 
               onClick={toggleSpeed}
               className="w-10 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors uppercase tracking-widest"
               title="Playback Speed"
             >
               {playbackRate}x
             </button>

             {/* Rewind 10s */}
             <button 
               onClick={() => skipTime(-10)}
               className="text-slate-400 hover:text-sky-600 transition-colors p-2"
               title="Rewind 10 seconds"
             >
               <RewindIcon className="w-6 h-6" />
               <span className="sr-only">-10s</span>
             </button>

             {/* Play/Pause */}
             <button 
               onClick={onPlayPause}
               className="w-14 h-14 flex items-center justify-center rounded-full bg-sky-500 text-white shadow-lg hover:bg-sky-600 hover:scale-105 transition-all active:scale-95 border-2 border-transparent hover:border-amber-400"
             >
               {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7 ml-0.5" />}
             </button>

             {/* Forward 30s */}
             <button 
               onClick={() => skipTime(30)}
               className="text-slate-400 hover:text-sky-600 transition-colors p-2"
               title="Forward 30 seconds"
             >
               <ForwardIcon className="w-6 h-6" />
               <span className="sr-only">+30s</span>
             </button>

             {/* Download */}
             <a 
               href={currentSermon.audioUrl}
               download
               target="_blank"
               rel="noreferrer"
               className="text-slate-300 hover:text-sky-600 transition-colors p-2"
               title="Download MP3"
             >
               <DownloadIcon className="w-6 h-6" />
             </a>
          </div>
        </div>
        
        {/* Mobile Only Title (Since we hid it in flex above to make room for buttons) */}
        <div className="sm:hidden text-center -mt-1">
          <h4 className="font-semibold text-slate-900 truncate text-xs brand-font tracking-wide">{currentSermon.title}</h4>
        </div>
      </div>
    </div>
  );
};

export default Player;