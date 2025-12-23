import {
  VOTING_SYSTEMS,
  type VotingSystem,
} from '@planning-poker/shared';

export function getCardsForVotingSystem(votingSystem: VotingSystem | undefined): string[] | undefined {
  if (!votingSystem) {
    return undefined;
  }

  if (!VOTING_SYSTEMS[votingSystem]) {
    return undefined;
  }

  return VOTING_SYSTEMS[votingSystem];
}
