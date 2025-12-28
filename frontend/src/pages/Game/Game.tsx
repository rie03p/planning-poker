import {useMemo, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {
  VStack, HStack, Text,
} from '@chakra-ui/react';
import {getCardsForVotingSystem, MAX_PARTICIPANTS, participantSchema} from '@planning-poker/shared';
import {useLocalStorage} from '../../hooks/useLocalStorage';
import {useGame} from '../../hooks/useGame';
import {NotFound} from '../NotFound';
import {JoinDialog} from './components/JoinDialog';
import {GameHeader} from './components/GameHeader';
import {GameTable} from './components/GameTable';
import {CardSelection} from './components/CardSelection';
import {ParticipantGroup} from './components/ParticipantGroup';
import {IssuesDrawer} from './components/IssuesDrawer';

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

  const handleVote = (value: string, selected: boolean) => {
    if (selected) {
      vote(undefined);
    } else {
      vote(value);
    }
  };

  return (
    <HStack
      align='stretch'
      minH='100vh'
      maxW='100vw'
      overflowX='hidden'
      gap={0}
      bg='gray.50'
    >
      <VStack flex={1} width='100%' gap={0}>
        <GameHeader
          gameId={gameId}
          activeIssueId={activeIssueId}
          issues={issues}
          isIssuesOpen={isIssuesOpen}
          onToggleIssues={() => {
            setIsIssuesOpen(!isIssuesOpen);
          }}
        />

        {/* Main Content Area */}
        <VStack
          flex={1}
          w='full'
          justify='center'
          gap={12}
          p={8}
          overflowY='auto'
        >
          {/* Participants - Top Group */}
          <ParticipantGroup
            participants={participants.slice(Math.ceil(participants.length / 2))}
            revealed={revealed}
          />

          {/* The Poker Table */}
          <GameTable
            hasAnyVotes={hasAnyVotes}
            revealed={revealed}
            reveal={reveal}
            reset={reset}
            activeIssueId={activeIssueId}
            issues={issues}
            voteNextIssue={voteNextIssue}
          />

          {/* Participants - Bottom Group */}
          <ParticipantGroup
            participants={participants.slice(0, Math.ceil(participants.length / 2))}
            revealed={revealed}
          />
        </VStack>

        {/* Card Selection Footer */}
        <CardSelection
          cards={cards}
          myVote={myVote}
          onVote={handleVote}
        />
      </VStack>

      {/* Issues Sidebar */}
      <IssuesDrawer
        isOpen={isIssuesOpen}
        onClose={() => {
          setIsIssuesOpen(false);
        }}
        issues={issues}
        activeIssueId={activeIssueId}
        onAddIssue={addIssue}
        onRemoveIssue={removeIssue}
        onSetActiveIssue={setActiveIssue}
        onUpdateIssue={updateIssue}
      />
    </HStack>
  );
}
