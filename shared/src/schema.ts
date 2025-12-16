import {z} from 'zod';

// API Request/Response schemas
export const createGameRequestSchema = z.object({
  votingSystem: z.string().optional(),
});

export const createGameResponseSchema = z.object({
  gameId: z.string(),
  votingSystem: z.string(),
});

export const registryExistsResponseSchema = z.object({
  exists: z.boolean(),
  votingSystem: z.string(),
});

// Game state schemas
export const participantSchema = z.object({
  id: z.string(),
  name: z.string(),
  vote: z.string().optional(),
});

// WebSocket message schemas
export const clientMessageSchema = z.discriminatedUnion('type', [
  z.object({type: z.literal('join'), name: z.string()}),
  z.object({type: z.literal('vote'), vote: z.string().optional()}),
  z.object({type: z.literal('reveal')}),
  z.object({type: z.literal('reset')}),
]);

export const serverMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('joined'),
    participants: z.array(participantSchema),
    revealed: z.boolean(),
    votingSystem: z.string(),
  }),
  z.object({
    type: z.literal('update'),
    participants: z.array(participantSchema),
    revealed: z.boolean(),
  }),
  z.object({
    type: z.literal('not-found'),
  }),
]);

// Type exports
export type CreateGameRequest = z.infer<typeof createGameRequestSchema>;
export type CreateGameResponse = z.infer<typeof createGameResponseSchema>;
export type RegistryExistsResponse = z.infer<typeof registryExistsResponseSchema>;
export type Participant = z.infer<typeof participantSchema>;
export type ClientMessage = z.infer<typeof clientMessageSchema>;
export type ServerMessage = z.infer<typeof serverMessageSchema>;
