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
      overflowX='auto'
      textAlign='center'
    >
      <HStack
        display='inline-flex'
        gap={3}
        pt={8}
        pb={4}
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
