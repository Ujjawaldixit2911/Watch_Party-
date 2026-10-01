import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Tv,
  Sparkles,
  User,
  Tv2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Radio,
} from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

export const CreateRoomPage: React.FC = () => {
  const { createRoom } = useRoom();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim();
    if (!trimmedUser || trimmedUser.length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }

    if (trimmedUser.length > 24) {
      setError('Username cannot exceed 24 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const code = await createRoom(trimmedUser, roomName.trim() || undefined);
      if (code) {
        setCreatedRoomCode(code);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create room.');
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
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Top back link */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Tv className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-zinc-300 font-heading">WatchParty</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-[#111113] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {!createdRoomCode ? (
          /* CREATE ROOM FORM */
          <>
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Host a New Room
              </div>
              <h2 className="text-2xl font-extrabold text-white font-heading">Create a Watch Party</h2>
              <p className="text-xs text-zinc-400">
                You'll be the room Host with full playback and moderation controls.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Username"
                placeholder="e.g. Alex, Rahul, Sarah"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                error={error}
                icon={<User className="w-4 h-4 text-zinc-400" />}
                autoFocus
                required
              />

              <Input
                label="Room Name (Optional)"
                placeholder="e.g. Friday Movie Night, Lo-fi Chill"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                icon={<Tv2 className="w-4 h-4 text-zinc-400" />}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full shadow-lg shadow-indigo-600/30 mt-2"
              >
                Create Watch Party
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-zinc-500">
                Want to join an existing party instead?{' '}
                <Link to="/join" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2">
                  Join a room
                </Link>
              </p>
            </div>
          </>
        ) : (
          /* ROOM READY SUCCESS CARD */
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white font-heading">Your Watch Party is Ready!</h3>
              <p className="text-xs text-zinc-400">Share your room code with friends so they can join.</p>
            </div>

            {/* Room Code Display */}
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Room Code</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-400 tracking-widest">
                {createdRoomCode}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button variant="secondary" size="md" onClick={handleCopyLink} className="w-full">
                {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2 text-indigo-400" />}
                {copied ? 'Invite Link Copied!' : 'Copy Invite Link'}
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={handleEnterRoom}
                className="w-full shadow-lg shadow-indigo-600/30"
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
