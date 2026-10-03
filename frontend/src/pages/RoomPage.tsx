import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Film,
  Info,
  Hand,
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
import { RequestQueuePanel } from '../components/RequestControl/RequestQueuePanel';
import { ChangeVideoModal } from '../components/Modals/ChangeVideoModal';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const RoomPage: React.FC = () => {
  const { roomCode: paramCode } = useParams<{ roomCode: string }>();
  const { state, joinRoom } = useRoom();
  const { user, addJoinedRoom } = useAuth();
  const { canControlPlayback, isParticipant, canResolveRequests } = usePermissions();
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
  const [activeRightTab, setActiveRightTab] = useState<'chat' | 'participants' | 'requests'>('chat');

  // Auto-switch to requests tab when new request arrives for host/mod
  useEffect(() => {
    if (canResolveRequests && state.pendingRequests.length > 0) {
      // Optional: keep tab or highlight
    }
  }, [state.pendingRequests.length, canResolveRequests]);

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

          {/* Control Request Trigger/Banner */}
          <RequestControl onOpenRequestsTab={() => setActiveRightTab('requests')} />
        </div>

        {/* Right Side: Tabbed Chat, Members, & Requests Column (Col span 4 on large screens) */}
        <div className="lg:col-span-4 flex flex-col h-[600px] lg:h-[calc(100vh-140px)] min-h-[500px]">
          {/* Tab Selection Bar */}
          <div className="flex mb-3 bg-[#0D0F1D]/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-xl backdrop-blur-xl gap-1">
            <button
              onClick={() => setActiveRightTab('chat')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'chat'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
              {state.chatHistory.length > 0 && (
                <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.2 rounded-full font-mono">
                  {state.chatHistory.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveRightTab('participants')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'participants'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Members</span>
              <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.2 rounded-full font-mono">
                {state.participants.length}
              </span>
            </button>

            {canResolveRequests && (
              <button
                onClick={() => setActiveRightTab('requests')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                  activeRightTab === 'requests'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/50'
                }`}
              >
                <Hand className="w-3.5 h-3.5" />
                <span>Requests</span>
                {state.pendingRequests.length > 0 && (
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full font-mono animate-pulse-subtle">
                    {state.pendingRequests.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 min-h-0 flex flex-col">
            {activeRightTab === 'chat' && <Chat />}
            {activeRightTab === 'participants' && <ParticipantList />}
            {activeRightTab === 'requests' && <RequestQueuePanel />}
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
