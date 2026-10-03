import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Share2,
  LogOut,
  Power,
  Copy,
  Check,
  Crown,
} from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { ShareRoomModal } from '../Modals/ShareRoomModal';
import { Modal } from '../ui/Modal';
import { toast } from 'sonner';

export const RoomHeader: React.FC = () => {
  const { state, leaveRoom, sendEndRoom } = useRoom();
  const { isHost } = usePermissions();
  const navigate = useNavigate();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEndRoomModalOpen, setIsEndRoomModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const room = state.room;
  const connectionStatus = state.connectionStatus;

  if (!room) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopiedCode(true);
    toast.success('Room code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleConfirmLeave = () => {
    leaveRoom();
    navigate('/');
  };

  const handleConfirmEndRoom = () => {
    sendEndRoom();
    setIsEndRoomModalOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="w-full bg-[#080B17]/90 border-b border-slate-700/50 backdrop-blur-2xl sticky top-0 z-40 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Brand Logo & Room Code Pill */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <Link to="/" className="flex-shrink-0" title="WatchParty Home">
              <Logo size="sm" />
            </Link>

            {/* Room Code Badge */}
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-inner">
              <span className="text-[11px] font-semibold text-zinc-400">Room Code:</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 hover:text-cyan-200 transition-colors"
                title="Click to copy room code"
              >
                <span>{room.roomCode}</span>
                {copiedCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-cyan-300" />
                )}
              </button>
            </div>
          </div>

          {/* Center / Right: Host Indicator, Copy Invite Link, Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Host pill with Gold Crown SVG */}
            {state.participants.find((p) => p.role === 'HOST') && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm">
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                <span>Host:</span>
                <span className="text-white font-bold max-w-[100px] truncate">
                  {state.participants.find((p) => p.role === 'HOST')?.username || 'Host'}
                </span>
              </div>
            )}

            {/* Glowing Cyan Copy Invite Link Button */}
            <button
              onClick={() => {
                const inviteUrl = `${window.location.origin}/join/${room.roomCode}`;
                navigator.clipboard.writeText(inviteUrl);
                toast.success('Invite link copied to clipboard!');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-950" />
              <span>Copy Invite Link</span>
            </button>

            {/* Connection Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-zinc-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                    : connectionStatus === 'connecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-red-400'
                }`}
              />
              <span className="capitalize hidden sm:inline">{connectionStatus}</span>
            </div>

            {/* Host End Room OR Participant Leave Button */}
            {isHost ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsEndRoomModalOpen(true)}
                className="text-xs h-8 px-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 shadow-md shadow-rose-600/20"
              >
                <Power className="w-3.5 h-3.5 mr-1" />
                End Room
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLeaveModalOpen(true)}
                className="text-xs h-8 px-2.5 rounded-xl border-slate-800 text-zinc-300 hover:text-rose-400 hover:border-rose-500/30 bg-slate-900/60"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Leave
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Share Modal */}
      <ShareRoomModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomCode={room.roomCode}
      />

      {/* End Room Confirmation Modal */}
      <Modal
        isOpen={isEndRoomModalOpen}
        onClose={() => setIsEndRoomModalOpen(false)}
        title="End Watch Party"
        description="This will close the room and disconnect all participants."
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-300">
            Are you sure you want to end this party for everyone? All playback and chat will terminate.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800/80">
            <Button variant="ghost" size="sm" onClick={() => setIsEndRoomModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmEndRoom}>
              <Power className="w-4 h-4 mr-1.5" />
              End Room Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Leave Room Confirmation Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Leave Watch Party"
        description="Leave this watch party session."
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-300">
            Are you sure you want to leave? You can rejoin anytime using the room code or invite link.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800/80">
            <Button variant="ghost" size="sm" onClick={() => setIsLeaveModalOpen(false)}>
              Stay
            </Button>
            <Button variant="secondary" size="sm" onClick={handleConfirmLeave}>
              <LogOut className="w-4 h-4 mr-1.5" />
              Leave Room
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
