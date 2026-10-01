import React, { useState } from 'react';
import {
  Users,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Crown,
  UserMinus,
} from 'lucide-react';
import { ParticipantPublic } from '@watchparty/shared';
import { useRoom } from '../../context/RoomContext';
import { usePermissions } from '../../hooks/usePermissions';
import { RoleBadge } from '../ui/Badge';
import { TransferHostModal } from '../Modals/TransferHostModal';
import { RemoveParticipantModal } from '../Modals/RemoveParticipantModal';

export const ParticipantList: React.FC = () => {
  const { state, sendAssignRole } = useRoom();
  const { isHost } = usePermissions();

  const [activeDropdownUserId, setActiveDropdownUserId] = useState<string | null>(null);
  const [transferTarget, setTransferTarget] = useState<ParticipantPublic | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ParticipantPublic | null>(null);

  const participants = state.participants;
  const currentUserId = state.currentUser?.userId;

  const handleToggleDropdown = (userId: string) => {
    setActiveDropdownUserId((prev) => (prev === userId ? null : userId));
  };

  const handlePromoteToMod = (userId: string) => {
    sendAssignRole(userId, 'MODERATOR');
    setActiveDropdownUserId(null);
  };

  const handleDemoteToParticipant = (userId: string) => {
    sendAssignRole(userId, 'PARTICIPANT');
    setActiveDropdownUserId(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#111113] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-heading">
            Participants ({participants.length})
          </h3>
        </div>
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-zinc-800/40">
        {participants.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            No participants found.
          </div>
        ) : (
          participants.map((p) => {
            const isMe = p.userId === currentUserId;
            const isDropdownOpen = activeDropdownUserId === p.userId;

            return (
              <div
                key={p.userId}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800/40 transition-colors pt-2 first:pt-0"
              >
                {/* Left: Avatar + Username + Role */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Avatar with status indicator */}
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#111113] ${
                        p.isConnected ? 'bg-emerald-400' : 'bg-zinc-500'
                      }`}
                      title={p.isConnected ? 'Connected' : 'Disconnected'}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-zinc-200 truncate">
                        {p.username}
                      </span>
                      {isMe && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-1.5 py-0.2 rounded border border-indigo-500/30">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Role Badge & Host Action Menu */}
                <div className="flex items-center gap-2 flex-shrink-0 relative">
                  <RoleBadge role={p.role} />

                  {/* Host Context Menu on other participants */}
                  {isHost && !isMe && (
                    <div className="relative">
                      <button
                        onClick={() => handleToggleDropdown(p.userId)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus:outline-none"
                        aria-label="Manage participant"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setActiveDropdownUserId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl z-50 py-1 text-xs animate-slide-up">
                            {p.role === 'PARTICIPANT' && (
                              <button
                                onClick={() => handlePromoteToMod(p.userId)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 text-left transition-colors"
                              >
                                <ShieldCheck className="w-4 h-4 text-purple-400" />
                                Promote to Moderator
                              </button>
                            )}

                            {p.role === 'MODERATOR' && (
                              <button
                                onClick={() => handleDemoteToParticipant(p.userId)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 text-left transition-colors"
                              >
                                <ShieldAlert className="w-4 h-4 text-amber-400" />
                                Demote to Viewer
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setTransferTarget(p);
                                setActiveDropdownUserId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 text-left transition-colors"
                            >
                              <Crown className="w-4 h-4 text-amber-400" />
                              Transfer Host Role
                            </button>

                            <div className="my-1 border-t border-zinc-800" />

                            <button
                              onClick={() => {
                                setRemoveTarget(p);
                                setActiveDropdownUserId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-left transition-colors"
                            >
                              <UserMinus className="w-4 h-4" />
                              Remove from Party
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modals */}
      <TransferHostModal
        isOpen={Boolean(transferTarget)}
        onClose={() => setTransferTarget(null)}
        targetParticipant={transferTarget}
      />

      <RemoveParticipantModal
        isOpen={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        targetParticipant={removeTarget}
      />
    </div>
  );
};
