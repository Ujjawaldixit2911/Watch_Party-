import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Tv,
  Share2,
  LogOut,
  Power,
  Copy,
  Check,
} from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { usePermissions } from '../../hooks/usePermissions';
import { RoleBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
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
      <header className="w-full bg-[#111113]/90 border-b border-zinc-800 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Room Title/Code */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-2 group flex-shrink-0"
              title="WatchParty Home"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
                <Tv className="w-5 h-5" />
              </div>
            </Link>

            <div className="min-w-0 flex items-center gap-2.5">
              <div>
                <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[140px] sm:max-w-xs font-heading">
                  {room.name || 'Watch Party'}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 font-bold tracking-wider transition-colors"
                    title="Click to copy room code"
                  >
                    <span>{room.roomCode}</span>
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Connection status, Share, Role Badge, Leave/End Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Connection Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse-subtle'
                    : connectionStatus === 'connecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-red-400'
                }`}
              />
              <span className="capitalize">{connectionStatus}</span>
            </div>

            {/* Share Room Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsShareModalOpen(true)}
              className="text-xs h-8 px-2.5"
            >
              <Share2 className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Share
            </Button>

            {/* User Role Badge */}
            {state.currentUser && (
              <div className="hidden md:block">
                <RoleBadge role={state.currentUser.role} />
              </div>
            )}

            {/* Host End Room OR Participant Leave Button */}
            {isHost ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsEndRoomModalOpen(true)}
                className="text-xs h-8 px-2.5"
              >
                <Power className="w-3.5 h-3.5 mr-1" />
                End Room
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLeaveModalOpen(true)}
                className="text-xs h-8 px-2.5 border-zinc-800 text-zinc-300 hover:text-red-400 hover:border-red-500/30"
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
          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800/80">
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
          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800/80">
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
