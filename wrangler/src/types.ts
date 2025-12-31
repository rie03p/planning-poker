import type {Participant, Issue} from '@planning-poker/shared';

export type Env = {
  GAME: DurableObjectNamespace;
  REGISTRY: DurableObjectNamespace;
  ALLOWED_ORIGINS: string;
};

export type GameState = {
  participants: Map<string, Participant>;
  revealed: boolean;
  issues: Issue[];
  activeIssueId: string | undefined;
};
