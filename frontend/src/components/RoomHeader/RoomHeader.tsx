import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Headphones,
  Share2,
  LogOut,
  Power,
  Copy,
  Check,
} from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { RoleBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ShareRoomModal } from '../Modals/ShareRoomModal';
import { Modal } from '../ui/Modal';
import { toast } from 'sonner';

export const RoomHeader: React.FC = () => {
  const { state, leaveRoom, sendEndRoom } = useRoom();
  const { user } = useAuth();
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
      <header className="w-full bg-[#070913]/90 border-b border-slate-800/90 backdrop-blur-xl sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Room Title/Code */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-2 group flex-shrink-0"
              title="BeatsLink Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <Headphones className="w-5 h-5" />
              </div>
            </Link>

            <div className="min-w-0 flex items-center gap-2.5">
              <div>
                <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[140px] sm:max-w-xs font-heading">
                  {room.name || 'BeatsLink Party'}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] font-mono text-purple-400 hover:text-purple-300 font-bold tracking-wider transition-colors"
                    title="Click to copy party code"
                  >
                    <span>{room.roomCode}</span>
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Connection status, Profile, Share, Role Badge, Leave/End */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Connection Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-medium text-zinc-300">
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

            {/* Profile link button if logged in */}
            {user && (
              <Link to="/profile" title="View BeatsLink Profile" className="hidden md:flex">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 hover:border-purple-500/60 transition-all text-xs text-zinc-300">
                  <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-[9px] font-bold text-white">
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-[11px] max-w-[80px] truncate">{user.name}</span>
                </div>
              </Link>
            )}

            {/* Share Room Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsShareModalOpen(true)}
              className="text-xs h-8 px-2.5 border-slate-700/80 text-zinc-200"
            >
              <Share2 className="w-3.5 h-3.5 mr-1 text-purple-400" />
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
                className="text-xs h-8 px-2.5 border-slate-800 text-zinc-300 hover:text-red-400 hover:border-red-500/30"
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
