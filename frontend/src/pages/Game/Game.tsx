import {useMemo, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {
  Box, VStack, HStack, Text, Button, Badge, Tooltip,
} from '@chakra-ui/react';
import {Menu} from 'lucide-react';
import {getCardsForVotingSystem, MAX_PARTICIPANTS, participantSchema} from '@planning-poker/shared';
import {useLocalStorage} from '../../hooks/useLocalStorage';
import {useGame} from '../../hooks/useGame';
import {NotFound} from '../NotFound';
import {JoinDialog} from './components/JoinDialog';
import {VoteCard} from './components/VoteCard';
import {ParticipantCard} from './components/ParticipantCard';
import {ActionArea} from './components/ActionArea';
import {CopyInviteBox} from './components/CopyInviteBox';
import {IssuesListContent} from './components/IssuesListContent';

export function Game() {
  const {gameId} = useParams<{gameId: string}>();
  if (typeof gameId !== 'string') {
    throw new TypeError('gameId is required');
  }

  const {
    value: name,
    setValue: setName,
  } = useLocalStorage<string>('planning-poker:name', '');

  useEffect(() => {
    if (name) {
      const result = participantSchema.shape.name.safeParse(name);
      if (!result.success) {
        setName('');
      }
    }
  }, [name, setName]);

  const game = useGame(gameId, name ?? '');

  const {
    participants,
    myVote,
    vote,
    revealed,
    reveal,
    reset,
    votingSystem,
    notFound,
    roomFull,
    issues,
    activeIssueId,
    addIssue,
    removeIssue,
    setActiveIssue,
    voteNextIssue,
    updateIssue,
  } = game;
  const [isIssuesOpen, setIsIssuesOpen] = useState(false);

  const hasAnyVotes = useMemo(
    () => participants.some(p => p.vote !== undefined),
    [participants],
  );

  if (!name) {
    return <JoinDialog isOpen={true} onJoin={setName} />;
  }

  if (notFound) {
    return <NotFound />;
  }

  if (roomFull) {
    return (
      <VStack minH='100vh' justify='center' align='center' gap={4}>
        <Text fontSize='2xl' fontWeight='bold'>
          Room is full
        </Text>
        <Text>
          This room has reached the maximum capacity ({MAX_PARTICIPANTS} participants).
        </Text>
      </VStack>
    );
  }

  if (!votingSystem) {
    return (
      <VStack minH='100vh' justify='center' align='center'>
        <Text>Connecting...</Text>
      </VStack>
    );
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
    <HStack align='stretch' minH='100vh' gap={0}>
      <VStack gap={8} py={8} flex={1} width='100%'>
        <VStack gap={4} width='100%' align='flex-end' pr={8}>
          <HStack>
            <CopyInviteBox gameId={gameId} />
            {!isIssuesOpen && (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Button onClick={() => {
                    setIsIssuesOpen(true);
                  }} variant='outline' colorPalette='gray'>
                    <Menu size={16} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Positioner>
                  <Tooltip.Content>Issues</Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>
            )}
          </HStack>
        </VStack>

        {/* Active Issue Display */}
        {activeIssueId && (
          <Box bg='white' p={4} borderRadius='lg' shadow='sm' maxW='600px'>
            <VStack>
              <Badge colorPalette='blue'>Voting Now</Badge>
              <Text fontSize='xl' fontWeight='bold'>
                {issues.find(i => i.id === activeIssueId)?.title}
              </Text>
            </VStack>
          </Box>
        )}
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
      <Box
        width={isIssuesOpen ? '400px' : '0'}
        borderLeftWidth={isIssuesOpen ? '1px' : '0'}
        borderColor='gray.200'
        bg='white'
        h='100vh'
        position='sticky'
        top={0}
        overflow='hidden'
        transition='width 0.3s ease-in-out, border-left-width 0.3s ease-in-out'
        style={{
          visibility: isIssuesOpen ? 'visible' : 'hidden',
        }}
      >
        {isIssuesOpen && (
          <IssuesListContent
            issues={issues}
            activeIssueId={activeIssueId}
            onAddIssue={title => {
              addIssue(title);
            }}
            onRemoveIssue={removeIssue}
            onSetActiveIssue={setActiveIssue}
            onUpdateIssue={updateIssue}
            onClose={() => {
              setIsIssuesOpen(false);
            }}
          />
        )}
      </Box>
    </HStack>
  );
}
