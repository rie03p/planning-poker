export const VOTING_SYSTEMS: Record<string, string[]> = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'],
  'modified-fibonacci': ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕'],
  tshirts: ['XS', 'S', 'M', 'L', 'XL', '?', '☕'],
  'powers-of-2': ['0', '1', '2', '4', '8', '16', '32', '64', '?', '☕'],
};

export function getCardsForVotingSystem(votingSystem: string | undefined): string[] | undefined {
  if (!votingSystem || !VOTING_SYSTEMS[votingSystem]) {
    return undefined;
  }

  return VOTING_SYSTEMS[votingSystem];
}
