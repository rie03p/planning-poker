export interface Env {
  GAME: DurableObjectNamespace;
  REGISTRY: DurableObjectNamespace;
}

export type CreateGameRequest = {
  votingSystem?: string;
};

export type CreateGameResponse = {
  gameId: string;
  votingSystem: string;
};
