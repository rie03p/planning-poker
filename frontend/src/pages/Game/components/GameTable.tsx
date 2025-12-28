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
  return (
    <Box
      bg='gray.800'
      borderRadius='100px'
      borderWidth='8px'
      borderColor='gray.700'
      px={20}
      py={10}
      minH='160px'
      minW='320px'
      display='flex'
      alignItems='center'
      justifyContent='center'
      textAlign='center'
      shadow='2xl'
      position='relative'
      color='white'
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
        onVoteNext={
          activeIssueId
          && issues.findIndex(i => i.id === activeIssueId) < issues.length - 1
            ? voteNextIssue
            : undefined
        }
      />
    </Box>
  );
}
