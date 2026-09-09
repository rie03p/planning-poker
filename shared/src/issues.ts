import type {Issue} from './schema';

export function getNextUnfinishedIssue(
  issues: readonly Issue[],
  activeIssueId: string | undefined,
) {
  const index = issues.findIndex(issue => issue.id === activeIssueId);
  return index === -1
    ? undefined
    : issues
        .slice(index + 1)
        .find(issue => !(issue.votingCompleted ?? issue.voteResults !== undefined));
}
