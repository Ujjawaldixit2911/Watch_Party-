import { z } from 'zod';

export const RoomCodeSchema = z
  .string()
  .trim()
  .regex(/^WK-[A-HJ-NP-Z2-9]{5}$/, {
    message: 'Room code must be in format WK-XXXXX (alphanumeric, excluding ambiguous chars)',
  });

export const UsernameSchema = z
  .string()
  .trim()
  .min(2, { message: 'Username must be at least 2 characters' })
  .max(24, { message: 'Username cannot exceed 24 characters' })
  .regex(/^[a-zA-Z0-9_\- ]+$/, {
    message: 'Username can only contain letters, numbers, underscores, dashes, and spaces',
  });

export const RoomNameSchema = z
  .string()
  .trim()
  .max(50, { message: 'Room name cannot exceed 50 characters' })
  .optional()
  .nullable();

export const YouTubeVideoIdSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_-]{11}$/, {
    message: 'Invalid YouTube Video ID (must be 11 valid characters)',
  });

export const PlaybackTimeSchema = z
  .number()
  .finite()
  .min(0, { message: 'Time cannot be negative' })
  .max(86400, { message: 'Time cannot exceed 24 hours' });

export const RoleSchema = z.enum(['HOST', 'MODERATOR', 'PARTICIPANT']);

export const ControlRequestTypeSchema = z.enum([
  'PLAY',
  'PAUSE',
  'SEEK',
  'CHANGE_VIDEO',
]);

export const ControlRequestDecisionSchema = z.enum(['APPROVED', 'REJECTED']);

// Payload schemas for WebSocket Events
export const CreateRoomEventSchema = z
  .object({
    username: UsernameSchema,
    roomName: RoomNameSchema,
  })
  .strict();

export const JoinRoomEventSchema = z
  .object({
    roomCode: RoomCodeSchema,
    username: UsernameSchema,
    sessionToken: z.string().trim().optional(),
  })
  .strict();

export const PlayEventSchema = z
  .object({
    time: PlaybackTimeSchema,
  })
  .strict();

export const PauseEventSchema = z
  .object({
    time: PlaybackTimeSchema,
  })
  .strict();

export const SeekEventSchema = z
  .object({
    time: PlaybackTimeSchema,
  })
  .strict();

export const ChangeVideoEventSchema = z
  .object({
    videoId: YouTubeVideoIdSchema,
  })
  .strict();

export const AssignRoleEventSchema = z
  .object({
    targetUserId: z.string().trim().min(1),
    role: z.enum(['MODERATOR', 'PARTICIPANT']),
  })
  .strict();

export const RemoveParticipantEventSchema = z
  .object({
    targetUserId: z.string().trim().min(1),
  })
  .strict();

export const TransferHostEventSchema = z
  .object({
    targetUserId: z.string().trim().min(1),
  })
  .strict();

export const RequestControlEventSchema = z
  .object({
    type: ControlRequestTypeSchema,
    payload: z
      .object({
        time: PlaybackTimeSchema.optional(),
        videoId: YouTubeVideoIdSchema.optional(),
      })
      .optional(),
  })
  .strict();

export const ResolveControlRequestEventSchema = z
  .object({
    requestId: z.string().trim().min(1),
    decision: ControlRequestDecisionSchema,
  })
  .strict();

export const SendMessageEventSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, { message: 'Message cannot be empty' })
      .max(500, { message: 'Message cannot exceed 500 characters' }),
  })
  .strict();

// REST Request Schemas
export const CreateRoomRestSchema = z
  .object({
    username: UsernameSchema,
    roomName: RoomNameSchema,
  })
  .strict();

export type CreateRoomEventInput = z.infer<typeof CreateRoomEventSchema>;
export type JoinRoomEventInput = z.infer<typeof JoinRoomEventSchema>;
export type PlayEventInput = z.infer<typeof PlayEventSchema>;
export type PauseEventInput = z.infer<typeof PauseEventSchema>;
export type SeekEventInput = z.infer<typeof SeekEventSchema>;
export type ChangeVideoEventInput = z.infer<typeof ChangeVideoEventSchema>;
export type AssignRoleEventInput = z.infer<typeof AssignRoleEventSchema>;
export type RemoveParticipantEventInput = z.infer<typeof RemoveParticipantEventSchema>;
export type TransferHostEventInput = z.infer<typeof TransferHostEventSchema>;
export type RequestControlEventInput = z.infer<typeof RequestControlEventSchema>;
export type ResolveControlRequestEventInput = z.infer<typeof ResolveControlRequestEventSchema>;
export type SendMessageEventInput = z.infer<typeof SendMessageEventSchema>;
export type CreateRoomRestInput = z.infer<typeof CreateRoomRestSchema>;
