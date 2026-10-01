import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'sonner';

interface ShareRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

export const ShareRoomModal: React.FC<ShareRoomModalProps> = ({
  isOpen,
  onClose,
  roomCode,
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/join/${roomCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Invite link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success('Room code copied!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Friends to Watch"
      description="Share this link or code with your friends to join the watch party."
    >
      <div className="space-y-4">
        {/* Room Code Display */}
        <div className="flex items-center justify-between p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Room Code</span>
            <div className="text-xl font-extrabold font-mono tracking-widest text-indigo-400 mt-0.5">
              {roomCode}
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleCopyCode}>
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy Code
          </Button>
        </div>

        {/* Shareable Link Input */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Direct Invite Link</span>
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="font-mono text-xs bg-zinc-950 text-zinc-300 select-all"
            />
            <Button variant="primary" size="md" onClick={handleCopy} className="flex-shrink-0">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
