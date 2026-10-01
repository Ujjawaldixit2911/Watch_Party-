import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Tv,
  KeyRound,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { checkRoomApi } from '../services/api';
import { CheckRoomResponse } from '@watchparty/shared';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const JoinRoomPage: React.FC = () => {
  const { roomCode: paramCode } = useParams<{ roomCode?: string }>();
  const { joinRoom } = useRoom();
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState(paramCode || '');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [roomStatusMessage, setRoomStatusMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Normalize code format
  const formatCode = (input: string) => {
    let clean = input.trim().toUpperCase();
    if (!clean.startsWith('WK-') && clean.length === 5) {
      clean = `WK-${clean}`;
    }
    return clean;
  };

  // Perform lightweight REST validation on room code blur / change
  useEffect(() => {
    const code = formatCode(roomCode);
    if (code.length === 8 && code.startsWith('WK-')) {
      setIsValidating(true);
      checkRoomApi(code)
        .then((res: CheckRoomResponse) => {
          if (res.exists) {
            setRoomStatusMessage(`Found Party: ${res.roomName || 'Watch Party'}`);
            setError('');
          } else {
            setRoomStatusMessage(null);
            setError('This room code was not found or has ended.');
          }
        })
        .catch(() => {
          setRoomStatusMessage(null);
        })
        .finally(() => setIsValidating(false));
    } else {
      setRoomStatusMessage(null);
    }
  }, [roomCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formattedCode = formatCode(roomCode);
    const trimmedUser = username.trim();

    if (!formattedCode || formattedCode.length < 5) {
      setError('Please enter a valid room code (e.g. WK-7F29Q).');
      return;
    }

    if (!trimmedUser || trimmedUser.length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await joinRoom(formattedCode, trimmedUser);
      if (success) {
        navigate(`/room/${formattedCode}`);
      }
    } catch (err: any) {
      setError(err.message || 'Could not join room.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

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
        <div className="space-y-1.5 text-center sm:text-left">
          <h2 className="text-2xl font-extrabold text-white font-heading">Join a Watch Party</h2>
          <p className="text-xs text-zinc-400">
            Enter the 5-character room code and your display name to start watching together.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Room Code"
              placeholder="e.g. WK-7F29Q or 7F29Q"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase());
                setError('');
              }}
              icon={<KeyRound className="w-4 h-4 text-zinc-400" />}
              autoFocus={!paramCode}
              required
            />
            {isValidating && (
              <p className="text-[11px] text-zinc-400 mt-1 pl-1">Checking room availability...</p>
            )}
            {roomStatusMessage && !error && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium mt-1 pl-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{roomStatusMessage}</span>
              </div>
            )}
          </div>

          <Input
            label="Your Username"
            placeholder="e.g. Maya, Sam"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            error={error}
            icon={<User className="w-4 h-4 text-zinc-400" />}
            autoFocus={Boolean(paramCode)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full shadow-lg shadow-indigo-600/30 mt-2"
          >
            Join Party
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-zinc-500">
            Want to start your own room?{' '}
            <Link to="/create" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2">
              Create a party
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
