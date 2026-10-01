import React, { useState } from 'react';
import {
  Hand,
  Play,
  Pause,
  FastForward,
  Film,
  Check,
  X,
  Clock,
  Send,
} from 'lucide-react';
import { ControlRequestType } from '@watchparty/shared';
import { useRoom } from '../../context/RoomContext';
import { usePermissions } from '../../hooks/usePermissions';
import { extractYouTubeVideoId, formatTime } from '../../utils/youtube';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

export const RequestControl: React.FC = () => {
  const { state, sendRequestControl, sendResolveControlRequest } = useRoom();
  const { canRequestControl, canResolveRequests } = usePermissions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ControlRequestType>('PLAY');
  const [seekSeconds, setSeekSeconds] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  const pendingRequests = state.pendingRequests;

  const handleOpenModal = (type: ControlRequestType) => {
    setSelectedType(type);
    setError('');
    setIsModalOpen(true);
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedType === 'SEEK') {
      const parsedTime = Number(seekSeconds);
      if (isNaN(parsedTime) || parsedTime < 0) {
        setError('Please enter a valid time in seconds.');
        return;
      }
      sendRequestControl('SEEK', { time: parsedTime });
    } else if (selectedType === 'CHANGE_VIDEO') {
      const id = extractYouTubeVideoId(videoUrl);
      if (!id) {
        setError('Please enter a valid YouTube video URL or ID.');
        return;
      }
      sendRequestControl('CHANGE_VIDEO', { videoId: id });
    } else {
      sendRequestControl(selectedType);
    }

    setIsModalOpen(false);
    setSeekSeconds('');
    setVideoUrl('');
  };

  return (
    <>
      {/* 1. HOST / MODERATOR INBOX */}
      {canResolveRequests && pendingRequests.length > 0 && (
        <div className="w-full bg-indigo-950/40 border border-indigo-500/40 rounded-2xl p-4 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500" />
              </span>
              <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider font-heading">
                Pending Control Requests ({pendingRequests.length})
              </h4>
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pendingRequests.map((req) => (
              <div
                key={req.requestId}
                className="flex items-center justify-between p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                    {req.type === 'PLAY' && <Play className="w-3.5 h-3.5" />}
                    {req.type === 'PAUSE' && <Pause className="w-3.5 h-3.5" />}
                    {req.type === 'SEEK' && <FastForward className="w-3.5 h-3.5" />}
                    {req.type === 'CHANGE_VIDEO' && <Film className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">
                      <span className="text-white font-bold">{req.requesterName}</span> wants to{' '}
                      <span className="text-indigo-400 lowercase">{req.type.replace('_', ' ')}</span>
                    </p>
                    {req.type === 'SEEK' && req.payload?.time !== undefined && (
                      <p className="text-[11px] text-zinc-400">Jump to {formatTime(req.payload.time)}</p>
                    )}
                    {req.type === 'CHANGE_VIDEO' && req.payload?.videoId && (
                      <p className="text-[11px] text-zinc-400 font-mono truncate">
                        Video: {req.payload.videoId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => sendResolveControlRequest(req.requestId, 'APPROVED')}
                    className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 border-emerald-500/40"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sendResolveControlRequest(req.requestId, 'REJECTED')}
                    className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. PARTICIPANT ACTION BAR */}
      {canRequestControl && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mr-1">
            <Hand className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium">Request:</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal('PLAY')}
            className="text-xs h-7 px-2.5 bg-zinc-800/50 hover:bg-zinc-800"
          >
            <Play className="w-3 h-3 mr-1 text-emerald-400" />
            Play
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal('PAUSE')}
            className="text-xs h-7 px-2.5 bg-zinc-800/50 hover:bg-zinc-800"
          >
            <Pause className="w-3 h-3 mr-1 text-amber-400" />
            Pause
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal('SEEK')}
            className="text-xs h-7 px-2.5 bg-zinc-800/50 hover:bg-zinc-800"
          >
            <FastForward className="w-3 h-3 mr-1 text-indigo-400" />
            Seek
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal('CHANGE_VIDEO')}
            className="text-xs h-7 px-2.5 bg-zinc-800/50 hover:bg-zinc-800"
          >
            <Film className="w-3 h-3 mr-1 text-purple-400" />
            Change Video
          </Button>
        </div>
      )}

      {/* Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Request to ${selectedType.replace('_', ' ')}`}
        description="Your request will be sent to the room Host and Moderators for approval."
      >
        <form onSubmit={handleSendRequest} className="space-y-4">
          {selectedType === 'SEEK' && (
            <Input
              label="Seek Time (Seconds)"
              placeholder="e.g. 120"
              type="number"
              min={0}
              value={seekSeconds}
              onChange={(e) => setSeekSeconds(e.target.value)}
              error={error}
              icon={<Clock className="w-4 h-4 text-zinc-400" />}
              autoFocus
            />
          )}

          {selectedType === 'CHANGE_VIDEO' && (
            <Input
              label="YouTube URL or Video ID"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              error={error}
              icon={<Film className="w-4 h-4 text-zinc-400" />}
              autoFocus
            />
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800/80">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Send Request
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
