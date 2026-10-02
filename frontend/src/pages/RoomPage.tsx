import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Film,
  Info,
} from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { usePermissions } from '../hooks/usePermissions';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { getSession } from '../utils/storage';
import { RoomHeader } from '../components/RoomHeader/RoomHeader';
import { VideoPlayer } from '../components/VideoPlayer/VideoPlayer';
import { PlaybackControls } from '../components/PlaybackControls/PlaybackControls';
import { ParticipantList } from '../components/ParticipantList/ParticipantList';
import { Chat } from '../components/Chat/Chat';
import { RequestControl } from '../components/RequestControl/RequestControl';
import { ChangeVideoModal } from '../components/Modals/ChangeVideoModal';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const RoomPage: React.FC = () => {
  const { roomCode: paramCode } = useParams<{ roomCode: string }>();
  const { state, joinRoom } = useRoom();
  const { canControlPlayback, isParticipant } = usePermissions();
  const navigate = useNavigate();

  // YouTube player hook bound to container 'yt-player-container'
  const {
    isPlayerReady,
    currentTime,
    duration,
    volume,
    isMuted,
    handlePlay,
    handlePause,
    handleSeek,
    handleVolumeChange,
    handleToggleMute,
    handleUnblockAutoplay,
  } = useYouTubePlayer('yt-player-container');

  const [isChangeVideoModalOpen, setIsChangeVideoModalOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'participants'>('chat');

  // Direct URL visitor join prompt
  const [isJoinPromptOpen, setIsJoinPromptOpen] = useState(false);
  const [guestUsername, setGuestUsername] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const roomCode = paramCode?.toUpperCase() || '';

  // Check if session exists or if we need to prompt for username
  useEffect(() => {
    if (!roomCode) return;

    if (!state.currentUser && !state.room) {
      const session = getSession(roomCode);
      if (session) {
        // Auto rejoin with stored token
        joinRoom(roomCode, session.username, session.sessionToken);
      } else {
        // Direct link visitor without session
        setIsJoinPromptOpen(true);
      }
    }
  }, [roomCode, state.currentUser, state.room]);

  const handleGuestJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');

    const trimmed = guestUsername.trim();
    if (!trimmed || trimmed.length < 2) {
      setJoinError('Username must be at least 2 characters.');
      return;
    }

    setIsJoining(true);
    try {
      const success = await joinRoom(roomCode, trimmed);
      if (success) {
        setIsJoinPromptOpen(false);
      }
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join room.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* 1. Header */}
      <RoomHeader />

      {/* 2. Main Watch Party Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Video Player, Controls, Info Bar, Requests (Col span 8 on large screens) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* YouTube Video Player Embed */}
          <VideoPlayer
            containerId="yt-player-container"
            isPlayerReady={isPlayerReady}
            onUnblockAutoplay={handleUnblockAutoplay}
          />

          {/* Now Playing Title & Quick Info */}
          <div className="flex items-center justify-between p-3.5 bg-[#111113] border border-zinc-800 rounded-2xl">
            <div className="min-w-0 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Film className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Now Playing
                </span>
                <h2 className="text-xs sm:text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                  {state.activeVideoTitle || 'Luis Fonsi - Despacito ft. Daddy Yankee'}
                </h2>
              </div>
            </div>

            {canControlPlayback && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsChangeVideoModalOpen(true)}
                className="text-xs h-8 px-3 flex-shrink-0"
              >
                Change Video
              </Button>
            )}
          </div>

          {/* Playback Controls Bar */}
          <PlaybackControls
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onOpenChangeVideo={() => setIsChangeVideoModalOpen(true)}
          />

          {/* Participant Info Banner */}
          {isParticipant && (
            <div className="flex items-center gap-2 p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-xs text-zinc-400">
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>
                You are viewing as a Participant. Playback is in real-time sync with Host & Moderators.
              </span>
            </div>
          )}

          {/* Control Request Section (Inbox for host / triggers for participants) */}
          <RequestControl />
        </div>

        {/* Right Side: Sidebar for Participants & Live Chat (Col span 4 on desktop, stacked on mobile) */}
        <div className="lg:col-span-4 flex flex-col space-y-4 h-[550px] lg:h-auto">
          {/* Mobile & Tablet Tab Toggle */}
          <div className="flex lg:hidden bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveMobileTab('chat')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeMobileTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Live Chat
            </button>
            <button
              onClick={() => setActiveMobileTab('participants')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeMobileTab === 'participants'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Participants ({state.participants.length})
            </button>
          </div>

          {/* Desktop Layout: Stacked Participants (top) & Chat (bottom) */}
          <div className="hidden lg:flex flex-col space-y-4 h-full">
            <div className="h-56">
              <ParticipantList />
            </div>
            <div className="flex-1 min-h-[360px]">
              <Chat />
            </div>
          </div>

          {/* Mobile/Tablet Tab View */}
          <div className="flex-1 lg:hidden min-h-0">
            {activeMobileTab === 'chat' ? <Chat /> : <ParticipantList />}
          </div>
        </div>
      </main>

      {/* Change Video Modal */}
      <ChangeVideoModal
        isOpen={isChangeVideoModalOpen}
        onClose={() => setIsChangeVideoModalOpen(false)}
      />

      {/* Direct Link Visitor Username Prompt Modal */}
      <Modal
        isOpen={isJoinPromptOpen}
        onClose={() => navigate('/')}
        title="Join Watch Party"
        description={`You've been invited to party room ${roomCode}. Enter your display name to join.`}
      >
        <form onSubmit={handleGuestJoin} className="space-y-4">
          <Input
            label="Display Username"
            placeholder="e.g. Charlie"
            value={guestUsername}
            onChange={(e) => {
              setGuestUsername(e.target.value);
              setJoinError('');
            }}
            error={joinError}
            autoFocus
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800/80">
            <Button variant="ghost" size="sm" type="button" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isJoining}>
              Join Party Now
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
