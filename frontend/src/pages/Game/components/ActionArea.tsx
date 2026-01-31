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
      <Text fontSize='lg' fontWeight='bold' color='white'>
        Pick your cards!
      </Text>
    );
  }

  if (!revealed) {
    return (
      <Button colorPalette='orange' size='lg' borderRadius='full' onClick={reveal} px={8}>
        Reveal votes
      </Button>
    );
  }

  // Revealed state
  if (onVoteNext) {
    return (
      <Button colorPalette='blue' size='lg' borderRadius='full' onClick={onVoteNext} px={8}>
        Vote next issue
      </Button>
    );
  }

  return (
    <Button
      colorPalette='gray'
      variant='surface'
      size='lg'
      borderRadius='full'
      onClick={reset}
      px={8}
    >
      Start new votes
    </Button>
  );
}
