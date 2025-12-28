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
      bg='white'
      borderTopWidth='1px'
      borderColor='gray.200'
      p={4}
      shadow='xs'
    >
      <HStack justify='center' gap={3}>
        {cards?.map(card => (
          <Box
            key={card}
            onClick={() => {
              onVote(card, myVote === card);
            }}
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
