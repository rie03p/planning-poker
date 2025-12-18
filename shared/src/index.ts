export {
  createGameRequestSchema,
  createGameResponseSchema,
  registryExistsResponseSchema,
  registryRegisterRequestSchema,
  registryUnregisterRequestSchema,
  participantSchema,
  clientMessageSchema,
  serverMessageSchema,
} from './schema';

export type {
  CreateGameRequest,
  CreateGameResponse,
  RegistryExistsResponse,
  RegistryRegisterRequest,
  RegistryUnregisterRequest,
  Participant,
  ClientMessage,
  ServerMessage,
} from './schema';
