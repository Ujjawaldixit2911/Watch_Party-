import React from 'react';
import { Crown, AlertTriangle } from 'lucide-react';
import { ParticipantPublic } from '@watchparty/shared';
import { useRoom } from '../../context/RoomContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface TransferHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetParticipant: ParticipantPublic | null;
}

export const TransferHostModal: React.FC<TransferHostModalProps> = ({
  isOpen,
  onClose,
  targetParticipant,
}) => {
  const { sendTransferHost } = useRoom();

  if (!targetParticipant) return null;

  const handleConfirm = () => {
    sendTransferHost(targetParticipant.userId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Host Privileges"
      description="Hand over room ownership to another participant."
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs leading-relaxed">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
          <p>
            Are you sure you want to transfer Host status to{' '}
            <strong className="text-white">{targetParticipant.username}</strong>? You will become a
            Moderator and won't be able to undo this without their permission.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800/80">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm} className="bg-amber-600 hover:bg-amber-500 border-amber-500/40">
            <Crown className="w-4 h-4 mr-1.5" />
            Confirm Transfer
          </Button>
        </div>
      </div>
    </Modal>
  );
};
