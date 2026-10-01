import React from 'react';
import { Volume2, Play } from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

interface VideoPlayerProps {
  containerId: string;
  isPlayerReady: boolean;
  onUnblockAutoplay: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  containerId,
  isPlayerReady,
  onUnblockAutoplay,
}) => {
  const { state } = useRoom();
  const { canControlPlayback } = usePermissions();

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 group">
      {/* 1. Underlying YouTube Iframe Container */}
      <div id={containerId} className="w-full h-full" />

      {/* 2. Loading Skeleton while YT API is initializing */}
      {!isPlayerReady && (
        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-3 z-10">
          <Skeleton className="w-full h-full absolute inset-0" />
          <div className="relative z-20 flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-medium">Connecting to YouTube Stream...</p>
          </div>
        </div>
      )}

      {/* 3. Transparent Click Blocker for Non-Privileged Viewers (Enforces Server-Authoritative Sync) */}
      {!canControlPlayback && (
        <div
          className="absolute inset-0 z-20 cursor-default"
          title="Playback is synchronized by Host and Moderators"
        />
      )}

      {/* 4. Autoplay Blocked Overlay (Required by browser media autoplay policies) */}
      {state.isAutoplayBlocked && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-30 animate-fade-in p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-600/20">
            <Volume2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">Audio / Playback Paused</h3>
            <p className="text-xs text-zinc-400 max-w-sm mt-1">
              Your browser blocked autoplay. Click below to jump straight to the party's current position!
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={onUnblockAutoplay}
            className="shadow-indigo-500/30"
          >
            <Play className="w-4 h-4 fill-current mr-1.5" />
            Join Live Playback
          </Button>
        </div>
      )}
    </div>
  );
};
