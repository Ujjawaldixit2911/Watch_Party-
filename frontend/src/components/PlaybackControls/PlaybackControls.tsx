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
    <div className="w-full bg-[#111113] border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* 1. Progress / Seek Bar */}
      <div className="relative flex items-center group">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.5}
          value={currentTime}
          disabled={!canControlPlayback}
          onChange={handleSeekChange}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: `linear-gradient(to right, #6366f1 ${progressPercent}%, #27272a ${progressPercent}%)`,
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
              className="h-10 w-10 rounded-xl shadow-md"
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
                className="h-10 w-10 rounded-xl opacity-60 cursor-not-allowed"
                aria-label="Playback locked"
              >
                <Lock className="w-4 h-4 text-zinc-400" />
              </Button>
            </Tooltip>
          )}

          {/* Time Display */}
          <div className="text-xs font-semibold text-zinc-300 font-mono tracking-wider bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-800/80">
            <span>{formatTime(currentTime)}</span>
            <span className="text-zinc-500 mx-1">/</span>
            <span className="text-zinc-400">{formatTime(duration)}</span>
          </div>

          {/* Change Video Button */}
          {canControlPlayback ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenChangeVideo}
              className="text-xs text-zinc-300 hover:text-white"
            >
              <Film className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Change Video
            </Button>
          ) : null}
        </div>

        {/* Right Side: Resync, Volume, Fullscreen */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Manual Resync Button (Available to everyone) */}
          <Tooltip content="Force resync with host">
            <Button
              variant="outline"
              size="sm"
              onClick={resync}
              className="text-xs text-zinc-300 hover:text-white border-zinc-800 bg-zinc-900/50"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
              Resync
            </Button>
          </Tooltip>

          {/* Volume Control */}
          <div className="flex items-center gap-2 bg-zinc-900/80 px-2.5 py-1.5 rounded-xl border border-zinc-800/80">
            <button
              onClick={onToggleMute}
              className="text-zinc-400 hover:text-white transition-colors focus:outline-none"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
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
              className="w-16 sm:w-20 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              aria-label="Volume slider"
            />
          </div>

          {/* Fullscreen Button */}
          <Tooltip content="Toggle fullscreen">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFullscreen}
              className="text-zinc-400 hover:text-white"
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
