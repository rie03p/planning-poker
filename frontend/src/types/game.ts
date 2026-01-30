import type {Participant, VotingSystem, Issue} from '@planning-poker/shared';

export type GameState = {
  participants: Participant[];
  revealed: boolean;
  myVote: string | undefined;
  votingSystem: VotingSystem | undefined;
  issues: Issue[];
  activeIssueId: string | undefined;
  notFound: boolean;
  roomFull: boolean;
  isSpectator: boolean;
};

export type GameActions = {
  vote: (value: string | undefined) => void;
  reveal: () => void;
  reset: () => void;
  addIssue: (title: string, description?: string, url?: string) => void;
  removeIssue: (issueId: string) => void;
  setActiveIssue: (issueId: string) => void;
  voteNextIssue: () => void;
  updateIssue: (issue: Issue) => void;
  removeAllIssues: () => void;
  disconnect: () => void;
  toggleSpectator: () => void;
};

export type UseGameReturn = GameState & GameActions;
