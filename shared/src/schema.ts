import {z} from 'zod';

export const MAX_PARTICIPANTS = 14;
export const MAX_ISSUES = 50;

export const votingSystemSchema = z.enum([
  'fibonacci',
  'modified-fibonacci',
  't-shirts',
  'powers-of-2',
]);

export type VotingSystem = z.infer<typeof votingSystemSchema>;

export const VOTING_SYSTEMS = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'],
  'modified-fibonacci': ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕'],
  't-shirts': ['XS', 'S', 'M', 'L', 'XL', '?', '☕'],
  'powers-of-2': ['0', '1', '2', '4', '8', '16', '32', '64', '?', '☕'],
} as const satisfies Record<VotingSystem, readonly string[]>;

export type VotingCard = typeof VOTING_SYSTEMS[VotingSystem][number];

// Helper function to get all valid cards across all voting systems
const getAllValidCards = (): string[] => [...new Set(Object.values(VOTING_SYSTEMS).flat())];

export const votingCardSchema = z.enum(getAllValidCards() as [string, ...string[]]);

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
  votingSystem: votingSystemSchema.optional(),
});

export const registryRegisterRequestSchema = z.object({
  gameId: z.string(),
  votingSystem: votingSystemSchema,
});

export const registryUnregisterRequestSchema = z.object({
  gameId: z.string(),
});

// Game state schemas
export const voteResultsSchema = z.record(z.string(), z.number());

export type VoteResults = z.infer<typeof voteResultsSchema>;

export const issueSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(1000).optional(),
  url: z.string().url().max(200).optional().or(z.literal('')),
  voteResults: voteResultsSchema.optional(),
});

export const participantSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(20).trim(),
  vote: votingCardSchema.optional(),
  isSpectator: z.boolean().optional(),
});

// WebSocket message schemas
export const clientMessageSchema = z.discriminatedUnion('type', [
  z.object({type: z.literal('join'), name: participantSchema.shape.name, clientId: participantSchema.shape.id.optional()}),
  z.object({type: z.literal('vote'), vote: votingCardSchema.optional()}),
  z.object({type: z.literal('reveal')}),
  z.object({type: z.literal('reset')}),
  z.object({
    type: z.literal('add-issue'),
    issue: issueSchema.omit({id: true}),
  }),
  z.object({type: z.literal('remove-issue'), issueId: z.string()}),
  z.object({type: z.literal('set-active-issue'), issueId: z.string()}),
  z.object({type: z.literal('vote-next-issue')}),
  z.object({
    type: z.literal('update-issue'),
    issue: issueSchema,
  }),
  z.object({type: z.literal('remove-all-issues')}),
  z.object({type: z.literal('toggle-spectator')}),
]);

export const serverMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('joined'),
    userId: z.string(),
    participants: z.array(participantSchema).max(MAX_PARTICIPANTS),
    revealed: z.boolean(),
    votingSystem: votingSystemSchema,
    issues: z.array(issueSchema).max(MAX_ISSUES),
    activeIssueId: z.string().optional(),
  }),
  z.object({
    type: z.literal('update'),
    participants: z.array(participantSchema).max(MAX_PARTICIPANTS),
    revealed: z.boolean(),
    issues: z.array(issueSchema).max(MAX_ISSUES).optional(),
    activeIssueId: z.string().optional(),
  }),
  z.object({
    type: z.literal('issue-added'),
    issue: issueSchema,
  }),
  z.object({
    type: z.literal('issue-removed'),
    issueId: z.string(),
  }),
  z.object({
    type: z.literal('issue-updated'),
    issue: issueSchema,
  }),
  z.object({
    type: z.literal('reset'),
    participants: z.array(participantSchema).max(MAX_PARTICIPANTS),
    issues: z.array(issueSchema).max(MAX_ISSUES),
    activeIssueId: z.string().optional(),
  }),
  z.object({
    type: z.literal('not-found'),
  }),
  z.object({
    type: z.literal('room-full'),
  }),
]);

// Type exports
export type CreateGameRequest = z.infer<typeof createGameRequestSchema>;
export type CreateGameResponse = z.infer<typeof createGameResponseSchema>;
export type RegistryExistsResponse = z.infer<typeof registryExistsResponseSchema>;
export type RegistryRegisterRequest = z.infer<typeof registryRegisterRequestSchema>;
export type RegistryUnregisterRequest = z.infer<typeof registryUnregisterRequestSchema>;
export type Issue = z.infer<typeof issueSchema>;
export type Participant = z.infer<typeof participantSchema>;
export type ClientMessage = z.infer<typeof clientMessageSchema>;
export type ServerMessage = z.infer<typeof serverMessageSchema>;
