import {useParams} from 'react-router-dom';
import {
  Box, VStack, HStack, Text,
} from '@chakra-ui/react';
import {useLocalStorage} from '../../hooks/useLocalStorage';
import {useGame} from '../../hooks/useGame';
import {getCardsForVotingSystem} from '../../utils/votingSystems';
import {NotFound} from '../NotFound';
import {JoinDialog} from './components/JoinDialog';
import {VoteCard} from './components/VoteCard';
import {ParticipantCard} from './components/ParticipantCard';
import {ActionArea} from './components/ActionArea';
import {CopyInviteBox} from './components/CopyInviteBox';

export function Game() {
  const {gameId} = useParams<{gameId: string}>();
  if (!gameId) {
    throw new Error('gameId is required');
  }

  const {
    value: name,
    setValue: setName,
  } = useLocalStorage<string>('planning-poker:name', '');

  const game = useGame(gameId, name || '');

  if (!name) {
    return <JoinDialog isOpen={true} onJoin={setName} />;
  }

  const {participants, myVote, vote, revealed, reveal, reset, votingSystem, notFound} = game;

  if (notFound) {
    return <NotFound />;
  }

  const cards = getCardsForVotingSystem(votingSystem);

  const renderParticipants = (list: typeof participants) => (
    <HStack
      gap={8}
      justify='center'
      flexWrap='wrap'
      minH='120px'
      align='center'
    >
      {list.map(p => (
        <ParticipantCard
          key={p.id}
          name={p.name}
          hasVoted={p.vote !== undefined}
          vote={p.vote}
          revealed={revealed}
        />
      ))}
    </HStack>
  );

  const handleVote = (value: string, selected: boolean) => {
    if (selected) {
      vote(undefined);
    } else {
      vote(value);
    }
  };

  return (
    <VStack gap={8} py={8}>
      <VStack gap={4} width='100%' align='flex-end' pr={8}>
        <CopyInviteBox gameId={gameId} />
      </VStack>
      <VStack gap={3} align='center' justify='center'>
        {/* Participants Area - Top */}
        {renderParticipants(participants.slice(Math.ceil(participants.length / 2)))}

        {/* Action Area */}
        <Box
          bg='blue.100'
          borderRadius='3xl'
          px={12}
          py={8}
          minH='120px'
          minW='320px'
          display='flex'
          alignItems='center'
          justifyContent='center'
          textAlign='center'
        >
          <ActionArea
            myVote={myVote}
            revealed={revealed}
            reveal={reveal}
            reset={reset}
          />
        </Box>

        {/* Participants Area - Bottom */}
        {renderParticipants(participants.slice(0, Math.ceil(participants.length / 2)))}
      </VStack>
      {/* Card Selection */}
      <VStack gap={4}>
        <Text fontSize='lg'>
          Choose your card 👇
        </Text>
        <HStack gap={2}>
          {cards?.map(card => (
            <Box
              key={card}
              onClick={() => {
                handleVote(card, myVote === card);
              }}
            >
              <VoteCard selected={myVote === card}>
                {card}
              </VoteCard>
            </Box>
          ))}
        </HStack>
      </VStack>
    </VStack>
  );
}
