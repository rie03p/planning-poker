import {VOTING_SYSTEMS, type VotingSystem} from './schema';

export function getCardsForVotingSystem(votingSystem: VotingSystem): readonly string[] {
  return VOTING_SYSTEMS[votingSystem];
}
