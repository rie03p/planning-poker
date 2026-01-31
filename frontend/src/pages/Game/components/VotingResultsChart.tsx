import {Box, HStack, Text, VStack} from '@chakra-ui/react';
import {type VoteResults} from '@planning-poker/shared';

type VotingResultsChartProps = {
  voteResults: VoteResults;
  cards?: readonly string[];
};

export function VotingResultsChart({voteResults, cards}: VotingResultsChartProps) {
  const entries = Object.entries(voteResults).sort((a, b) => {
    // If cards definition is available, sort by index in cards array
    if (cards) {
      const indexA = cards.indexOf(a[0]);
      const indexB = cards.indexOf(b[0]);
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
    }

    // Fallback sort: try numeric first, then alphabetic
    const numberA = Number(a[0]);
    const numberB = Number(b[0]);
    if (!Number.isNaN(numberA) && !Number.isNaN(numberB)) {
      return numberA - numberB;
    }

    return a[0].localeCompare(b[0]);
  });

  const values = Object.values(voteResults);
  const maxVotes = Math.max(...values, 1);
  const totalVotes = values.reduce((sum: number, count: number) => sum + count, 0);

  if (entries.length === 0) {
    return (
      <Text color='gray.500' textAlign='center' py={4}>
        No votes recorded.
      </Text>
    );
  }

  return (
    <VStack gap={4} w='full' h='200px'>
      <Text fontSize='sm' color='gray.600' textAlign='center'>
        Total votes: {totalVotes}
      </Text>
      <HStack gap={4} flex={1} align='flex-end' justify='center' w='full' px={4}>
        {entries.map(([card, countValue]) => {
          const count = countValue as number;
          const percentage = (count / maxVotes) * 100;
          return (
            <VStack key={card} gap={2} flex={1} maxW='60px' h='full' justify='flex-end'>
              <VStack gap={1} flex={1} w='full' justify='flex-end'>
                <Text fontSize='xs' fontWeight='bold' textAlign='center'>
                  {count}
                </Text>
                <Box
                  w='full'
                  bg='blue.500'
                  borderRadius='md'
                  transition='height 0.5s ease-out'
                  h={`${percentage}%`}
                  minH={count > 0 ? '4px' : '0'}
                  position='relative'
                >
                  <Box
                    position='absolute'
                    inset={0}
                    bg='white'
                    opacity={0.1}
                    backgroundImage='linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)'
                    backgroundSize='1rem 1rem'
                  />
                </Box>
              </VStack>
              <Box
                textAlign='center'
                fontWeight='bold'
                fontSize='md'
                bg='gray.100'
                color='gray.700'
                borderRadius='md'
                w='full'
                py={1}
              >
                {card}
              </Box>
            </VStack>
          );
        })}
      </HStack>
    </VStack>
  );
}
