import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Film,
  Info,
} from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { useAuth } from '../context/AuthContext';
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
  const { user, addJoinedRoom } = useAuth();
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
  const [guestUsername, setGuestUsername] = useState(user?.name || '');
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

  // Record room in user's joined history when active
  useEffect(() => {
    if (state.room && user) {
      addJoinedRoom(state.room.roomCode, state.room.name || 'Watch Party Room');
    }
  }, [state.room?.roomCode]);

  const handleGuestJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');

    const trimmed = guestUsername.trim() || user?.name || '';
    if (!trimmed || trimmed.length < 2) {
      setJoinError('Username must be at least 2 characters.');
      return;
    }

    setIsJoining(true);
    try {
      const success = await joinRoom(roomCode, trimmed);
      if (success) {
        setIsJoinPromptOpen(false);
        addJoinedRoom(roomCode, state.room?.name || 'Watch Party Room');
      }
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join room.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070814] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />

      {/* 1. Header */}
      <RoomHeader />

      {/* 2. Main Watch Party Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        {/* Left Side: Video Player, Controls, Info Bar, Requests (Col span 8 on large screens) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* YouTube Video Player Embed */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-black">
            <VideoPlayer
              containerId="yt-player-container"
              isPlayerReady={isPlayerReady}
              onUnblockAutoplay={handleUnblockAutoplay}
            />
          </div>

          {/* Now Playing Title & Quick Info */}
          <div className="flex items-center justify-between p-3.5 bg-[#0D0F1D]/90 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-xl">
            <div className="min-w-0 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Film className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
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
                className="text-xs h-8 px-3 flex-shrink-0 bg-slate-900/90 border-slate-700/80 hover:border-purple-500/50 rounded-xl text-zinc-200 hover:text-white"
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
            <div className="flex items-center gap-2 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs text-slate-400">
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>
                You are viewing as a Participant. Playback is in real-time sync with Host & Moderators.
              </span>
            </div>
          )}

          {/* Control Request Section (Inbox for host / triggers for participants) */}
          <RequestControl />
        </div>

        {/* Right Side: Tabbed Chat & Participant List (Col span 4 on large screens) */}
        <div className="lg:col-span-4 flex flex-col h-[600px] lg:h-auto min-h-[500px]">
          {/* Mobile View Toggle */}
          <div className="flex sm:hidden mb-2 bg-[#111113] p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveMobileTab('chat')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeMobileTab === 'chat'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat ({state.chatHistory.length})</span>
            </button>
            <button
              onClick={() => setActiveMobileTab('participants')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeMobileTab === 'participants'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Members ({state.participants.length})</span>
            </button>
          </div>

          <div className="flex-1 grid grid-rows-1 lg:grid-rows-2 gap-4">
            {/* 1. Chat Container (visible if chat tab active or on large screens) */}
            <div
              className={`h-full min-h-0 ${
                activeMobileTab === 'chat' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
              }`}
            >
              <Chat />
            </div>

            {/* 2. Participant List Container */}
            <div
              className={`h-full min-h-0 ${
                activeMobileTab === 'participants'
                  ? 'flex flex-col'
                  : 'hidden lg:flex lg:flex-col'
              }`}
            >
              <ParticipantList />
            </div>
          </div>
        </div>
      </main>

      {/* Change Video Modal */}
      <ChangeVideoModal
        isOpen={isChangeVideoModalOpen}
        onClose={() => setIsChangeVideoModalOpen(false)}
      />

      {/* Direct link guest join prompt modal */}
      <Modal
        isOpen={isJoinPromptOpen}
        onClose={() => {}} // Non-closable without entering username
        title="Join Watch Party"
      >
        <form onSubmit={handleGuestJoin} className="space-y-4">
          <p className="text-xs text-zinc-400">
            You're joining room <span className="font-mono text-indigo-400 font-bold">{roomCode}</span>. Please choose a display name to participate.
          </p>

          <Input
            label="Your Display Name"
            placeholder="e.g. Alex, Maya"
            value={guestUsername}
            onChange={(e) => {
              setGuestUsername(e.target.value);
              setJoinError('');
            }}
            error={joinError}
            autoFocus
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isJoining}
              className="bg-indigo-600 hover:bg-indigo-500 font-semibold"
            >
              Enter Party
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
