import { useLocalStorage } from "../../hooks/useLocalStorage"
import { useParams } from "react-router-dom"
import { JoinDialog } from './components/JoinDialog'
import { useGame } from "../../hooks/useGame"
import { Box, VStack, HStack, Text } from "@chakra-ui/react"
import { VoteCard } from "./components/VoteCard"
import { ParticipantCard } from "./components/ParticipantCard"
import { ActionArea } from "./components/ActionArea"
import { getCardsForVotingSystem } from "../../utils/votingSystems"

export function Game() {
  const { gameId } = useParams<{ gameId: string }>()
  if (!gameId) throw new Error('gameId is required')

  const {
    value: name,
    setValue: setName,
  } = useLocalStorage<string>('planning-poker:name', '')

  const game = useGame(gameId, name || '')

  if (!name) {
    return <JoinDialog isOpen={true} onJoin={setName} />
  }

  const { participants, myVote, vote, revealed, reveal, reset, votingSystem } = game
  const cards = getCardsForVotingSystem(votingSystem)

  const renderParticipants = (list: typeof participants) => (
    <HStack
      gap={8}
      justify="center"
      flexWrap="wrap"
      minH="120px"
      align="center"
    >
      {list.map((p) => (
        <ParticipantCard
          key={p.id}
          name={p.name}
          hasVoted={p.vote !== null}
          vote={p.vote}
          revealed={revealed}
        />
      ))}
    </HStack>
  )

  const handleVote = (value: string, selected: boolean) => {
    if (selected) {
      vote(null)
    } else {
      vote(value)
    }
  }

  return (
    <VStack gap={8} py={8} align="center">
      <VStack gap={3} align="center" justify="center">
        {/* Participants Area - Top */}
        {renderParticipants(
          participants.slice(Math.ceil(participants.length / 2))
        )}

        {/* Action Area */}
        <Box
          bg="blue.100"
          borderRadius="3xl"
          px={12}
          py={8}
          minH="120px"
          minW="320px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <ActionArea
            myVote={myVote}
            revealed={revealed}
            reveal={reveal}
            reset={reset}
          />
        </Box>

        {/* Participants Area - Bottom */}
        {renderParticipants(
          participants.slice(0, Math.ceil(participants.length / 2))
        )} 
      </VStack>
      {/* Card Selection */}
      <VStack gap={4}>
        <Text fontSize="lg">
          Choose your card 👇
        </Text>
        <HStack gap={2}>
          {cards && cards.map((card) => (
            <Box
              key={card}
              onClick={() => handleVote(card, myVote === card)}
            >
              <VoteCard selected={myVote === card}>
                {card}
              </VoteCard>
            </Box>
          ))}
        </HStack>
      </VStack>
    </VStack>
  )
}