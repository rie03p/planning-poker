export type Env = {
  GAME: DurableObjectNamespace;
  REGISTRY: DurableObjectNamespace;
};

export type CreateGameRequest = {
  votingSystem?: string;
};

export function isCreateGameRequest(value: unknown): value is CreateGameRequest {
  return (
    typeof value === 'object'
    && value !== null
    && (
      !('votingSystem' in value)
      || typeof (value as any).votingSystem === 'string'
    )
  );
}

export type CreateGameResponse = {
  gameId: string;
  votingSystem: string;
};

export type RegistryExistsResponse = {
  exists: boolean;
  votingSystem: string;
};

export type Participant = {
  id: string;
  name: string;
  vote: string | undefined;
};

export type GameState = {
  participants: Map<string, Participant>;
  revealed: boolean;
};

export type Message = {
  type: string;
  name?: string;
  vote?: string;
};
