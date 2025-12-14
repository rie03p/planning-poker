export type Env = {
  GAME: DurableObjectNamespace;
  REGISTRY: DurableObjectNamespace;
};

export type CreateGameRequest = {
  votingSystem?: string;
};

export type CreateGameResponse = {
  gameId: string;
  votingSystem: string;
};

export type RegistryExistsResponse = {
  exists: boolean;
  votingSystem?: string;
};
