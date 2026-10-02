import React, { useState } from 'react';
import { Youtube, CheckCircle, Music2, Sparkles, Play } from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '../../utils/youtube';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ChangeVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_SONGS = [
  {
    title: 'Despacito ft. Daddy Yankee',
    artist: 'Luis Fonsi',
    id: 'kJQP7kiw5Fk',
    tag: 'Default Hit',
  },
  {
    title: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    id: 'dQw4w9WgXcQ',
    tag: 'Classic Pop',
  },
  {
    title: 'Lofi Hip Hop Radio',
    artist: 'Lofi Girl',
    id: 'jfKfPfyJRdk',
    tag: 'Study & Chill',
  },
  {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    id: '4NRXx6U8ABQ',
    tag: 'Synthwave Hit',
  },
  {
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    id: 'JGwWNGJdvx8',
    tag: 'Acoustic Pop',
  },
];

export const ChangeVideoModal: React.FC<ChangeVideoModalProps> = ({ isOpen, onClose }) => {
  const { sendChangeVideo } = useRoom();
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const [extractedId, setExtractedId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    setError('');

    if (val.trim()) {
      const id = extractYouTubeVideoId(val);
      setExtractedId(id);
      if (!id) {
        setError('Please enter a valid YouTube video URL or 11-char ID.');
      }
    } else {
      setExtractedId(null);
    }
  };

  const handleSelectPreset = (videoId: string) => {
    setUrlInput(`https://www.youtube.com/watch?v=${videoId}`);
    setExtractedId(videoId);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYouTubeVideoId(urlInput);
    if (!id) {
      setError('Please enter a valid YouTube URL or video ID');
      return;
    }

    sendChangeVideo(id);
    setUrlInput('');
    setExtractedId(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Video or Song"
      description="Paste any YouTube URL/ID or select a trending preset track from the BeatsLink locker."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="YouTube URL or Video ID"
          placeholder="https://www.youtube.com/watch?v=... or ID"
          value={urlInput}
          onChange={handleInputChange}
          error={error}
          icon={<Youtube className="w-4 h-4 text-red-500" />}
          autoFocus
        />

        {/* Video Preview Card */}
        {extractedId && (
          <div className="flex items-center gap-3 p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl animate-fade-in">
            <img
              src={getYouTubeThumbnail(extractedId)}
              alt="Video thumbnail preview"
              className="w-20 h-14 object-cover rounded-lg border border-zinc-700/60"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Valid Video Detected</span>
              </div>
              <p className="text-xs font-mono text-zinc-400 truncate mt-0.5">ID: {extractedId}</p>
            </div>
          </div>
        )}

        {/* Preset Songs Picker */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Trending Tracks & Default Presets</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {PRESET_SONGS.map((song) => {
              const isSelected = extractedId === song.id;
              return (
                <button
                  type="button"
                  key={song.id}
                  onClick={() => handleSelectPreset(song.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/80 text-white'
                      : 'bg-zinc-900/70 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                    {isSelected ? <Play className="w-3.5 h-3.5 fill-current" /> : <Music2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate leading-tight">{song.title}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{song.artist} • <span className="text-indigo-400">{song.tag}</span></p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800/80">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={!extractedId || Boolean(error)}
          >
            Change Video Now
          </Button>
        </div>
      </form>
    </Modal>
  );
};
