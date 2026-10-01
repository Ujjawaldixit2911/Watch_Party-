import { useRoom } from '../context/RoomContext';
import { Role } from '@watchparty/shared';

export function usePermissions() {
  const { state } = useRoom();
  const role: Role = state.currentUser?.role || 'PARTICIPANT';

  const isHost = role === 'HOST';
  const isModerator = role === 'MODERATOR';
  const isParticipant = role === 'PARTICIPANT';

  return {
    role,
    isHost,
    isModerator,
    isParticipant,
    canControlPlayback: isHost || isModerator,
    canManageRoles: isHost,
    canRemoveParticipants: isHost,
    canTransferHost: isHost,
    canEndRoom: isHost,
    canRequestControl: isParticipant,
    canResolveRequests: isHost || isModerator,
  };
}
