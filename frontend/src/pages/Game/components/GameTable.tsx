import {Box} from '@chakra-ui/react';
import {type Issue} from '@planning-poker/shared';
import {ActionArea} from './ActionArea';

type GameTableProps = {
  hasAnyVotes: boolean;
  revealed: boolean;
  reveal: () => void;
  reset: () => void;
  activeIssueId: string | undefined;
  issues: Issue[];
  voteNextIssue: () => void;
};

export function GameTable({
  hasAnyVotes,
  revealed,
  reveal,
  reset,
  activeIssueId,
  issues,
  voteNextIssue,
}: GameTableProps) {
  const handleVoteNext = (() => {
    if (!activeIssueId) {
      return undefined;
    }

    const index = issues.findIndex(i => i.id === activeIssueId);
    return index !== -1 && index < issues.length - 1 ? voteNextIssue : undefined;
  })();

  return (
    <Box
      position='relative'
      display='flex'
      alignItems='center'
      justifyContent='center'
      minH='160px'
      minW='320px'
      px={20}
      py={10}
      bg='gray.800'
      color='white'
      textAlign='center'
      borderRadius='100px'
      borderWidth='8px'
      borderColor='gray.700'
      shadow='2xl'
      _before={{
        content: '""',
        position: 'absolute',
        inset: '4px',
        borderRadius: '92px',
        borderWidth: '2px',
        borderColor: 'whiteAlpha.100',
        pointerEvents: 'none',
      }}
    >
      <ActionArea
        hasAnyVotes={hasAnyVotes}
        revealed={revealed}
        reveal={reveal}
        reset={reset}
        onVoteNext={handleVoteNext}
      />
    </Box>
  );
}
