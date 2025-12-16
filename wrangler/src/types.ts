import type {Participant} from '@planning-poker/shared';

export type Env = {
  GAME: DurableObjectNamespace;
  REGISTRY: DurableObjectNamespace;
};

export type GameState = {
  participants: Map<string, Participant>;
  revealed: boolean;
};
