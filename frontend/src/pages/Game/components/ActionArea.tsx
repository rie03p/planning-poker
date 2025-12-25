import {Button, Text} from '@chakra-ui/react';

export function ActionArea({
  hasAnyVotes,
  revealed,
  reveal,
  reset,
  onVoteNext,
}: {
  hasAnyVotes: boolean;
  revealed: boolean;
  reveal: () => void;
  reset: () => void;
  onVoteNext?: () => void;
}) {
  if (!hasAnyVotes) {
    return (
      <Text fontSize='xl' fontWeight='medium'>
        Pick your cards!
      </Text>
    );
  }

  if (!revealed) {
    return (
      <Button colorPalette='blue' onClick={reveal}>
        Reveal votes
      </Button>
    );
  }

  // Revealed state
  if (onVoteNext) {
    return (
      <Button colorPalette='green' onClick={onVoteNext}>
        Vote next issue
      </Button>
    );
  }

  return (
    <Button colorPalette='gray' onClick={reset}>
      Start new votes
    </Button>
  );
}
