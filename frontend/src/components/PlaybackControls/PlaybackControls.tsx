import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Film,
  Lock,
} from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { usePermissions } from '../../hooks/usePermissions';
import { formatTime } from '../../utils/youtube';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

interface PlaybackControlsProps {
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onOpenChangeVideo: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentTime,
  duration,
  volume,
  isMuted,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onOpenChangeVideo,
}) => {
  const { state, resync } = useRoom();
  const { canControlPlayback } = usePermissions();

  const isPlaying = state.playback.state === 'PLAYING';
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    onSeek(newTime);
  };

  const handleToggleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="w-full bg-[#0D0F1D]/90 border border-slate-800/80 rounded-2xl p-4 shadow-2xl space-y-3 backdrop-blur-xl">
      {/* 1. Progress / Seek Bar with purple glow gradient */}
      <div className="relative flex items-center group px-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.5}
          value={currentTime}
          disabled={!canControlPlayback}
          onChange={handleSeekChange}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:cursor-not-allowed disabled:opacity-60 transition-all hover:h-2.5"
          style={{
            background: `linear-gradient(to right, #a855f7 ${progressPercent}%, #6366f1 ${progressPercent}%, #1e293b ${progressPercent}%)`,
          }}
          aria-label="Video scrubber"
        />
      </div>

      {/* 2. Control Buttons and Information Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Left Side: Play/Pause, Time, Change Video */}
        <div className="flex items-center gap-3">
          {canControlPlayback ? (
            <Button
              variant="primary"
              size="icon"
              onClick={isPlaying ? onPause : onPlay}
              className="h-10 w-10 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 hover:scale-105 transition-all"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </Button>
          ) : (
            <Tooltip content="Only Host and Moderators can control playback">
              <Button
                variant="secondary"
                size="icon"
                disabled
                className="h-10 w-10 rounded-2xl opacity-60 cursor-not-allowed bg-slate-800 border-slate-700"
                aria-label="Playback locked"
              >
                <Lock className="w-4 h-4 text-zinc-400" />
              </Button>
            </Tooltip>
          )}

          {/* Time Display */}
          <div className="text-xs font-semibold text-zinc-300 font-mono tracking-wider bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner">
            <span className="text-white">{formatTime(currentTime)}</span>
            <span className="text-slate-500 mx-1.5">/</span>
            <span className="text-slate-400">{formatTime(duration)}</span>
          </div>

          {/* Change Video Button */}
          {canControlPlayback ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenChangeVideo}
              className="text-xs text-zinc-200 hover:text-white bg-slate-900/90 border-slate-700/80 hover:border-purple-500/50 rounded-xl"
            >
              <Film className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Change Video
            </Button>
          ) : null}
        </div>

        {/* Right Side: Drift Lock Badge, Resync, Volume, Fullscreen */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Active 0.0s Drift Lock Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-pulse-subtle" />
            <span>0.0s Drift Lock</span>
          </div>

          {/* Manual Resync Button (Available to everyone) */}
          <Tooltip content="Force resync with host">
            <Button
              variant="outline"
              size="sm"
              onClick={resync}
              className="text-xs text-zinc-300 hover:text-white border-slate-800 bg-slate-900/80 hover:bg-slate-800 rounded-xl"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Resync
            </Button>
          </Tooltip>

          {/* Volume Control */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
            <button
              onClick={onToggleMute}
              className="text-zinc-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-zinc-300" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-16 sm:w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              aria-label="Volume slider"
            />
          </div>

          {/* Fullscreen Button */}
          <Tooltip content="Toggle fullscreen">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFullscreen}
              className="text-zinc-400 hover:text-white rounded-xl hover:bg-slate-800"
              aria-label="Toggle Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
