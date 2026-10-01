import React from 'react';
import { UserX, AlertCircle } from 'lucide-react';
import { ParticipantPublic } from '@watchparty/shared';
import { useRoom } from '../../context/RoomContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface RemoveParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetParticipant: ParticipantPublic | null;
}

export const RemoveParticipantModal: React.FC<RemoveParticipantModalProps> = ({
  isOpen,
  onClose,
  targetParticipant,
}) => {
  const { sendRemoveParticipant } = useRoom();

  if (!targetParticipant) return null;

  const handleConfirm = () => {
    sendRemoveParticipant(targetParticipant.userId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Remove Participant"
      description="Remove a user from this Watch Party session."
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs leading-relaxed">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <p>
            Are you sure you want to remove <strong className="text-white">{targetParticipant.username}</strong> from
            the watch party? Their session will be invalidated and they will be disconnected immediately.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800/80">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirm}>
            <UserX className="w-4 h-4 mr-1.5" />
            Remove User
          </Button>
        </div>
      </div>
    </Modal>
  );
};
