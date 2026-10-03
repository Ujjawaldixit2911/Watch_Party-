import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  User,
  Tv2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Radio,
  Music,
  Lock,
} from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { useAuth, DEFAULT_LOCKER_SONGS } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { toast } from 'sonner';

export const CreateRoomPage: React.FC = () => {
  const { createRoom, sendChangeVideo } = useRoom();
  const { user, isAuthenticated, addCreatedRoom } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.name || '');
  const [roomName, setRoomName] = useState('');
  const [selectedStarterSong, setSelectedStarterSong] = useState('kJQP7kiw5Fk'); // Despacito by default
  const [customVideoId, setCustomVideoId] = useState('');
  const [useCustomVideo, setUseCustomVideo] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // If user is not authenticated, show the login-first gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070913] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-purple-500 selection:text-white">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/20 blur-[130px] rounded-full pointer-events-none" />

        {/* Top back link */}
        <div className="w-full max-w-md mb-6 flex items-center justify-between z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Logo size="sm" />
        </div>

        {/* Login required guard card */}
        <div className="w-full max-w-md bg-[#0F1222]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 text-center backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto shadow-lg shadow-purple-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Host Verification Required
            </div>
            <h2 className="text-2xl font-extrabold text-white font-heading">
              Please Log In First
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              To host a room, manage synchronized playback, and safeguard your media locker, you must sign in with your WatchParty account.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link to="/login?redirect=/create" className="block w-full">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30"
              >
                Sign In to Your Account
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            <Link to="/register?redirect=/create" className="block w-full">
              <Button variant="secondary" size="md" className="w-full text-xs">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const hostName = username.trim() || user?.name || 'Party Host';
    if (hostName.length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }

    if (hostName.length > 24) {
      setError('Username cannot exceed 24 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const code = await createRoom(hostName, roomName.trim() || undefined);
      if (code) {
        setCreatedRoomCode(code);
        addCreatedRoom(code, roomName.trim() || `${hostName}'s Watch Party`);

        // If custom or selected starting song is different, queue it
        const chosenSong = useCustomVideo && customVideoId.trim() ? customVideoId.trim() : selectedStarterSong;
        if (chosenSong && chosenSong !== 'kJQP7kiw5Fk') {
          setTimeout(() => {
            sendChangeVideo(chosenSong);
          }, 300);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create room.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdRoomCode) return;
    const url = `${window.location.origin}/join/${createdRoomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Invite link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterRoom = () => {
    if (createdRoomCode) {
      navigate(`/room/${createdRoomCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-gradient-to-r from-purple-600/20 to-indigo-600/15 blur-[130px] rounded-full pointer-events-none" />

      {/* Top back link */}
      <div className="w-full max-w-lg mb-6 flex items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <Link to="/profile" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
            {user?.name.charAt(0)}
          </div>
          <span className="text-xs font-semibold text-zinc-300">
            {user?.name}
          </span>
        </Link>
      </div>

      <div className="w-full max-w-lg bg-[#0F1222]/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 backdrop-blur-xl">
        {!createdRoomCode ? (
          /* CREATE ROOM FORM */
          <>
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Host a Synchronized Room
              </div>
              <h2 className="text-2xl font-extrabold text-white font-heading">Create a Watch Party</h2>
              <p className="text-xs text-zinc-400">
                You will be the Room Host with server-authoritative playback controls and chat moderation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Host Display Name"
                placeholder="e.g. Alex"
                value={username || user?.name || ''}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                error={error}
                icon={<User className="w-4 h-4 text-zinc-400" />}
                required
              />

              <Input
                label="Room Name (Optional)"
                placeholder="e.g. Friday Beats Party, Study Session"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                icon={<Tv2 className="w-4 h-4 text-zinc-400" />}
              />

              {/* Starter Track Selector with Despacito highlighted */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-purple-400" />
                  <span>Choose Starting Music / Video</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEFAULT_LOCKER_SONGS.slice(0, 4).map((song) => {
                    const isSelected = !useCustomVideo && selectedStarterSong === song.videoId;
                    return (
                      <button
                        type="button"
                        key={song.id}
                        onClick={() => {
                          setSelectedStarterSong(song.videoId);
                          setUseCustomVideo(false);
                        }}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-purple-600/20 border-purple-500/80 text-white shadow-md'
                            : 'bg-slate-900/60 border-slate-800 text-zinc-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-10 h-8 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 relative">
                          <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-purple-600/40 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate leading-tight">{song.title}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{song.artist}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Video Option */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setUseCustomVideo(!useCustomVideo)}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
                  >
                    {useCustomVideo ? '← Pick a preset song instead' : '+ Or paste a custom YouTube URL / ID'}
                  </button>
                </div>

                {useCustomVideo && (
                  <Input
                    label="Custom YouTube Video ID"
                    placeholder="e.g. kJQP7kiw5Fk"
                    value={customVideoId}
                    onChange={(e) => setCustomVideoId(e.target.value)}
                  />
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 mt-3"
              >
                Launch Watch Room
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-zinc-500">
                Want to join someone else's room instead?{' '}
                <Link to="/join" className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2">
                  Join with room code
                </Link>
              </p>
            </div>
          </>
        ) : (
          /* ROOM READY SUCCESS CARD */
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white font-heading">Your Watch Party is Live!</h3>
              <p className="text-xs text-zinc-400">Share your 5-letter party code or direct invite link with friends.</p>
            </div>

            {/* Room Code Display */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Party Room Code</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-400 tracking-widest">
                {createdRoomCode}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button variant="secondary" size="md" onClick={handleCopyLink} className="w-full">
                {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2 text-purple-400" />}
                {copied ? 'Invite Link Copied!' : 'Copy Invite Link'}
              </Button>

              <Button
                size="lg"
                onClick={handleEnterRoom}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30"
              >
                Enter Party Room
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
