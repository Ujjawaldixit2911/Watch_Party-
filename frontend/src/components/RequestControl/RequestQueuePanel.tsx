import React from 'react';
import {
  Hand,
  Play,
  Pause,
  FastForward,
  Film,
  Check,
  X,
  CheckCheck,
  XCircle,
  Clock,
} from 'lucide-react';
import { ControlRequest } from '@watchparty/shared';
import { useRoom } from '../../context/RoomContext';
import { usePermissions } from '../../hooks/usePermissions';
import { formatTime } from '../../utils/youtube';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

export const RequestQueuePanel: React.FC = () => {
  const { state, sendResolveControlRequest } = useRoom();
  const { canResolveRequests } = usePermissions();

  const requests = state.pendingRequests;

  const handleApprove = (request: ControlRequest) => {
    sendResolveControlRequest(request.requestId, 'APPROVED');
    toast.success(`Approved ${request.requesterName}'s ${request.type} request!`);
  };

  const handleReject = (request: ControlRequest) => {
    sendResolveControlRequest(request.requestId, 'REJECTED');
    toast.info(`Rejected request from ${request.requesterName}`);
  };

  const handleApproveAll = () => {
    if (requests.length === 0) return;
    requests.forEach((req) => {
      sendResolveControlRequest(req.requestId, 'APPROVED');
    });
    toast.success(`Approved all ${requests.length} pending requests!`);
  };

  const handleRejectAll = () => {
    if (requests.length === 0) return;
    requests.forEach((req) => {
      sendResolveControlRequest(req.requestId, 'REJECTED');
    });
    toast.info(`Rejected all ${requests.length} requests`);
  };

  if (!canResolveRequests) {
    return (
      <div className="flex flex-col h-full bg-[#0D0F1D]/90 border border-slate-800/80 rounded-2xl overflow-hidden p-6 text-center justify-center items-center backdrop-blur-xl">
        <Hand className="w-8 h-8 text-slate-500 mb-2" />
        <p className="text-xs text-slate-400 font-semibold">Only Host & Moderators can view the Request Queue.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0F1322]/90 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-700/50 bg-slate-900/70">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Hand className="w-4 h-4 text-amber-400" />
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading">
            Control Requests ({requests.length})
          </h3>
        </div>

        {requests.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleApproveAll}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1 transition-all"
              title="Approve all requests"
            >
              <CheckCheck className="w-3 h-3" />
              <span>Approve All</span>
            </button>
            <button
              onClick={handleRejectAll}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded-lg border border-rose-500/30 flex items-center gap-1 transition-all"
              title="Reject all requests"
            >
              <XCircle className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {requests.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-500 border border-slate-700/40">
              <Hand className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-300">No Pending Requests</p>
            <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
              When viewers request to Play, Pause, Seek, or Change Video, their requests will appear here for one-click approval.
            </p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.requestId}
              className="p-3 bg-[#13162B] border border-slate-700/60 hover:border-amber-500/40 rounded-2xl shadow-lg transition-all space-y-2.5"
            >
              {/* Requester Info & Request Type Badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 text-[10px] font-bold border border-slate-700">
                    {req.requesterName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-white truncate">
                    {req.requesterName}
                  </span>
                </div>

                {/* Request Type Badge */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 border border-slate-700">
                  {req.type === 'PLAY' && (
                    <>
                      <Play className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
                      <span className="text-emerald-300">Play</span>
                    </>
                  )}
                  {req.type === 'PAUSE' && (
                    <>
                      <Pause className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span className="text-amber-300">Pause</span>
                    </>
                  )}
                  {req.type === 'SEEK' && (
                    <>
                      <FastForward className="w-2.5 h-2.5 text-purple-400" />
                      <span className="text-purple-300">Seek</span>
                    </>
                  )}
                  {req.type === 'CHANGE_VIDEO' && (
                    <>
                      <Film className="w-2.5 h-2.5 text-cyan-400" />
                      <span className="text-cyan-300">Change Video</span>
                    </>
                  )}
                </div>
              </div>

              {/* Request Payload Details */}
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 text-xs">
                {req.type === 'PLAY' && (
                  <p className="text-slate-300 text-[11px]">
                    Requesting to <strong className="text-emerald-400">resume playback</strong>.
                  </p>
                )}
                {req.type === 'PAUSE' && (
                  <p className="text-slate-300 text-[11px]">
                    Requesting to <strong className="text-amber-400">pause playback</strong>.
                  </p>
                )}
                {req.type === 'SEEK' && (
                  <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      Jump to time: <strong className="text-purple-300 font-mono font-bold">{formatTime(req.payload?.time || 0)}</strong>
                    </span>
                  </div>
                )}
                {req.type === 'CHANGE_VIDEO' && (
                  <div className="flex items-center gap-1.5 text-slate-300 text-[11px] truncate">
                    <Film className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">
                      Video ID: <strong className="text-cyan-300 font-mono">{req.payload?.videoId}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Approve (performs action) & Reject */}
              <div className="flex items-center gap-2 pt-0.5">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApprove(req)}
                  className="flex-1 h-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReject(req)}
                  className="h-8 px-3 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-slate-800"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
