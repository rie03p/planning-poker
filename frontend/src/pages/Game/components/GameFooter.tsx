import {useState, useEffect} from 'react';
import {Box} from '@chakra-ui/react';
import {Eye} from 'lucide-react';
import {type VoteResults} from '@planning-poker/shared';
import {CardSelection} from './CardSelection';
import {VotingResultsChart} from './VotingResultsChart';

type GameFooterProps = {
  cards: readonly string[] | undefined;
  myVote: string | undefined;
  onVote: (vote: string, selected: boolean) => void;
  revealed: boolean;
  voteResults: VoteResults | undefined;
  isSpectator: boolean;
};

export function GameFooter({
  cards,
  myVote,
  onVote,
  revealed,
  voteResults,
  isSpectator,
}: GameFooterProps) {
  const showResults = revealed && voteResults !== undefined;
  const [displayedResults, setDisplayedResults] = useState<VoteResults | undefined>(voteResults);

  // FIXME:
  // This state is used to keep the voting results mounted long enough
  // to allow the exit animation to finish when "Start new votes" is clicked.
  useEffect(() => {
    if (voteResults) {
      setDisplayedResults(voteResults);
    }
  }, [voteResults]);

  return (
    <Box
      w='full'
      bg='white'
      borderTopWidth='1px'
      borderColor='gray.200'
      shadow='xs'
      overflow='hidden'
      position='relative'
      transition='height 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      height={showResults ? '250px' : '110px'}
    >
      {/* Cards Selection - Slides down when results shown */}
      <Box
        position='absolute'
        left={0}
        right={0}
        bottom={0}
        height='110px'
        transform={showResults ? 'translateY(100%)' : 'translateY(0)'}
        transition='transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s'
        opacity={showResults ? 0 : 1}
        pointerEvents={showResults ? 'none' : 'auto'}
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        {isSpectator
          ? (
            <Box
              bg='gray.50'
              px={6}
              py={3}
              borderRadius='full'
              color='gray.500'
              fontWeight='medium'
              borderWidth='1px'
              borderColor='gray.200'
              display='flex'
              alignItems='center'
              gap={2}
            >
              <Eye size={20} />
              You are in spectator mode
            </Box>
          )
          : (
            <CardSelection
              cards={cards}
              myVote={myVote}
              onVote={onVote}
            />
          )}
      </Box>

      {/* Voting Results - Slides up from bottom */}
      {/* When voteResults becomes undefined, the component is immediately removed from DOM,
          preventing the animation from being visible */}
      <Box
        position='absolute'
        left={0}
        right={0}
        bottom={0}
        height='250px'
        p={6}
        display='flex'
        alignItems='center'
        justifyContent='center'
        transform={showResults ? 'translateY(0)' : 'translateY(100%)'}
        transition='transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s'
        opacity={showResults ? 1 : 0}
        pointerEvents={showResults ? 'auto' : 'none'}
      >
        <Box w='full' maxW='800px'>
          {displayedResults && <VotingResultsChart voteResults={displayedResults} cards={cards} />}
        </Box>
      </Box>
    </Box>
  );
}
