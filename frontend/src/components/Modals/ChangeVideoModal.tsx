import React, { useState } from 'react';
import { Youtube, CheckCircle } from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '../../utils/youtube';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ChangeVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
      title="Change Video"
      description="Paste any YouTube URL or 11-character Video ID to play for everyone."
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
