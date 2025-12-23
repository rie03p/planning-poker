import {z} from 'zod';

export const votingSystemSchema = z.enum([
  'fibonacci',
  'modified-fibonacci',
  't-shirts',
  'powers-of-2',
]);

export type VotingSystem = z.infer<typeof votingSystemSchema>;

// API Request/Response schemas
export const createGameRequestSchema = z.object({
  votingSystem: votingSystemSchema.optional(),
});

export const createGameResponseSchema = z.object({
  gameId: z.string(),
  votingSystem: votingSystemSchema,
});

export const registryExistsResponseSchema = z.object({
  exists: z.boolean(),
  votingSystem: votingSystemSchema,
});

export const registryRegisterRequestSchema = z.object({
  gameId: z.string(),
  votingSystem: votingSystemSchema,
});

export const registryUnregisterRequestSchema = z.object({
  gameId: z.string(),
});

// Game state schemas
export const participantSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(20).trim(),
  vote: z.string().optional(),
});

// WebSocket message schemas
export const clientMessageSchema = z.discriminatedUnion('type', [
  z.object({type: z.literal('join'), name: participantSchema.shape.name}),
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
    type: z.literal('reset'),
    participants: z.array(participantSchema),
  }),
  z.object({
    type: z.literal('not-found'),
  }),
]);

// Type exports
export type CreateGameRequest = z.infer<typeof createGameRequestSchema>;
export type CreateGameResponse = z.infer<typeof createGameResponseSchema>;
export type RegistryExistsResponse = z.infer<typeof registryExistsResponseSchema>;
export type RegistryRegisterRequest = z.infer<typeof registryRegisterRequestSchema>;
export type RegistryUnregisterRequest = z.infer<typeof registryUnregisterRequestSchema>;
export type Participant = z.infer<typeof participantSchema>;
export type ClientMessage = z.infer<typeof clientMessageSchema>;
export type ServerMessage = z.infer<typeof serverMessageSchema>;
