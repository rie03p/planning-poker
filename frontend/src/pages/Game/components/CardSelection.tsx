import {Box, HStack} from '@chakra-ui/react';
import {VoteCard} from './VoteCard';

type CardSelectionProps = {
  cards: readonly string[] | undefined;
  myVote: string | undefined;
  onVote: (vote: string, selected: boolean) => void;
};

export function CardSelection({
  cards,
  myVote,
  onVote,
}: CardSelectionProps) {
  return (
    <Box
      w='full'
      overflowX='auto'
      textAlign='center'
      h='full'
      display='flex'
      alignItems='center'
      justifyContent='center'
    >
      <HStack
        display='inline-flex'
        gap={3}
        px={4}
      >
        {cards?.map(card => (
          <Box
            key={card}
            flexShrink={0}
            onClick={() => {
              onVote(card, myVote === card);
            }}
            pb={1}
            cursor='pointer'
          >
            <VoteCard selected={myVote === card}>
              {card}
            </VoteCard>
          </Box>
        ))}
      </HStack>
    </Box>
  );
}
