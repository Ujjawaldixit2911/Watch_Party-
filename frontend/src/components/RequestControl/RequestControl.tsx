import React, { useState } from 'react';
import {
  Hand,
  Play,
  Pause,
  FastForward,
  Film,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react';
import { ControlRequestType } from '@watchparty/shared';
import { useRoom } from '../../context/RoomContext';
import { usePermissions } from '../../hooks/usePermissions';
import { extractYouTubeVideoId } from '../../utils/youtube';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { toast } from 'sonner';

interface RequestControlProps {
  onOpenRequestsTab?: () => void;
}

export const RequestControl: React.FC<RequestControlProps> = ({ onOpenRequestsTab }) => {
  const { state, sendRequestControl } = useRoom();
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
      toast.success(`Seek request sent to Host!`);
    } else if (selectedType === 'CHANGE_VIDEO') {
      const id = extractYouTubeVideoId(videoUrl);
      if (!id) {
        setError('Please enter a valid YouTube video URL or ID.');
        return;
      }
      sendRequestControl('CHANGE_VIDEO', { videoId: id });
      toast.success(`Video change request sent to Host!`);
    } else {
      sendRequestControl(selectedType);
      toast.success(`${selectedType} request sent to Host!`);
    }

    setIsModalOpen(false);
    setSeekSeconds('');
    setVideoUrl('');
  };

  return (
    <>
      {/* 1. HOST / MODERATOR QUICK ALERT BANNER */}
      {canResolveRequests && pendingRequests.length > 0 && (
        <div className="w-full bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border border-amber-500/40 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center justify-between gap-3 animate-fade-in backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Hand className="w-5 h-5 animate-bounce-subtle" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-heading">
                  {pendingRequests.length} Pending Control {pendingRequests.length === 1 ? 'Request' : 'Requests'}
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                Latest from <strong className="text-white">{pendingRequests[pendingRequests.length - 1].requesterName}</strong>: {pendingRequests[pendingRequests.length - 1].type.replace('_', ' ')}
              </p>
            </div>
          </div>

          {onOpenRequestsTab && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenRequestsTab}
              className="h-8 px-3.5 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20 flex-shrink-0"
            >
              Review Requests
            </Button>
          )}
        </div>
      )}

      {/* 2. PARTICIPANT ACTION BAR (Request to Play, Pause, Seek, Change Video) */}
      {canRequestControl && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0D0F1D]/90 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Request Control:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenModal('PLAY')}
              className="text-xs h-7.5 px-3 bg-slate-900/80 hover:bg-slate-800 border-slate-700/60 text-slate-200 rounded-xl"
            >
              <Play className="w-3 h-3 mr-1 text-emerald-400 fill-emerald-400" />
              Play
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenModal('PAUSE')}
              className="text-xs h-7.5 px-3 bg-slate-900/80 hover:bg-slate-800 border-slate-700/60 text-slate-200 rounded-xl"
            >
              <Pause className="w-3 h-3 mr-1 text-amber-400 fill-amber-400" />
              Pause
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenModal('SEEK')}
              className="text-xs h-7.5 px-3 bg-slate-900/80 hover:bg-slate-800 border-slate-700/60 text-slate-200 rounded-xl"
            >
              <FastForward className="w-3 h-3 mr-1 text-purple-400" />
              Seek
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenModal('CHANGE_VIDEO')}
              className="text-xs h-7.5 px-3 bg-slate-900/80 hover:bg-slate-800 border-slate-700/60 text-slate-200 rounded-xl"
            >
              <Film className="w-3 h-3 mr-1 text-cyan-400" />
              Change Video
            </Button>
          </div>
        </div>
      )}

      {/* Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Request to ${selectedType.replace('_', ' ')}`}
        description="Your request will be sent to the room Host for approval."
      >
        <form onSubmit={handleSendRequest} className="space-y-4">
          {selectedType === 'PLAY' && (
            <p className="text-xs text-slate-300">
              Request the Host to start / resume playing the current video for everyone.
            </p>
          )}

          {selectedType === 'PAUSE' && (
            <p className="text-xs text-slate-300">
              Request the Host to pause the video playback for everyone.
            </p>
          )}

          {selectedType === 'SEEK' && (
            <Input
              label="Seek Time (Seconds)"
              placeholder="e.g. 120 (for 2:00)"
              type="number"
              min={0}
              value={seekSeconds}
              onChange={(e) => setSeekSeconds(e.target.value)}
              error={error}
              icon={<Clock className="w-4 h-4 text-purple-400" />}
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
              icon={<Film className="w-4 h-4 text-cyan-400" />}
              autoFocus
            />
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Send to Host
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

