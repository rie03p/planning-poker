import {Box} from '@chakra-ui/react';
import {type Issue, getNextUnfinishedIssue} from '@planning-poker/shared';
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
  const handleVoteNext = getNextUnfinishedIssue(issues, activeIssueId) ? voteNextIssue : undefined;

  return (
    <Box
      position='relative'
      display='flex'
      alignItems='center'
      justifyContent='center'
      h='160px'
      w='320px'
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
