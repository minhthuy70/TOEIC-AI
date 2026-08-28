"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, RotateCw, Volume2, Volume1, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  className?: string;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function AudioPlayer({ src, autoPlay = false, onEnded, className = "" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play().catch(e => console.error("AutoPlay prevented:", e));
    }
  }, [src, autoPlay]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error(e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 0;
      setCurrentTime(current);
      setDuration(dur);
      setProgress(dur > 0 ? (current / dur) * 100 : 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (Number(e.target.value) / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(Number(e.target.value));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (onEnded) onEnded();
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex flex-col gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 w-full shadow-lg ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={handleTimeUpdate}
      />
      
      {/* Progress Bar */}
      <div className="flex items-center gap-3 w-full">
        <span className="text-xs text-zinc-400 font-mono w-10 text-right">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={progress || 0}
          onChange={handleSeek}
          className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400"
        />
        <span className="text-xs text-zinc-400 font-mono w-10">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        
        {/* Play/Pause & Skip */}
        <div className="flex flex-1 items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 text-white transition-transform active:scale-95 shadow-md shadow-red-600/20"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>
          
          <button 
            onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 5; }} 
            className="text-zinc-400 hover:text-white transition p-1.5 rounded-lg hover:bg-zinc-800"
            title="Lùi 5 giây"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => { if (audioRef.current) audioRef.current.currentTime += 5; }} 
            className="text-zinc-400 hover:text-white transition p-1.5 rounded-lg hover:bg-zinc-800"
            title="Tiến 5 giây"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Speed Control */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition w-12 text-center"
            >
              {speed}x
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden shadow-xl z-10 w-16">
                {SPEEDS.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSpeed(s); setShowSpeedMenu(false); }}
                    className={`block w-full text-center px-2 py-1.5 text-xs hover:bg-zinc-700 ${speed === s ? 'text-red-400 font-bold bg-zinc-900/50' : 'text-zinc-300'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 w-28">
            <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition p-1 rounded hover:bg-zinc-800">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400 hover:accent-zinc-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}