import { useLocalStorage } from "../../hooks/useLocalStorage"
import { useParams } from "react-router-dom"
import { JoinDialog } from './components/JoinDialog'
import { useGame } from "../../hooks/useGame"
import { Box, VStack, HStack, Text, Button } from "@chakra-ui/react"
import { VoteCard } from "./components/VoteCard"

const CARDS = ['0', '1', '2', '4', '8', '16', '32', '64', '?', '☕']

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

  const { participants, myVote, vote, revealed, reveal, reset } = game

  return (
    <VStack gap={8} py={8} align="center">
      <VStack gap={3} align="center" justify="center">
        {/* Participants Area - Top */}
        <HStack gap={8} justify="center" flexWrap="wrap" minH="120px" align="center">
          {participants.slice(Math.ceil(participants.length / 2)).map((participant) => (
            <VStack key={participant.id} gap={1}>
              <Box
                w="60px"
                h="80px"
                bg="gray.200"
                borderRadius="md"
              />
              <Text fontWeight="medium" fontSize="sm">{participant.name}</Text>
            </VStack>
          ))}
        </HStack>

        {/* Action Area */}
        <Box
          bg="blue.100"
          borderRadius="3xl"
          px={12}
          py={8}
          textAlign="center"
        >
          <Text fontSize="xl" fontWeight="medium">
            {myVote ? 'Reveal Cards' : 'Pick your cards!'}
          </Text>
        </Box>

        {/* Participants Area - Bottom */}
        <HStack gap={8} justify="center" flexWrap="wrap" minH="120px" align="center">
          {participants.slice(0, Math.ceil(participants.length / 2)).map((participant) => (
            <VStack key={participant.id} gap={1}>
              <Box
                w="60px"
                h="80px"
                bg="gray.200"
                borderRadius="md"
              />
              <Text fontWeight="medium" fontSize="sm">{participant.name}</Text>
            </VStack>
          ))}
        </HStack>
      </VStack>
      {/* Card Selection */}
      <VStack gap={4}>
        <Text fontSize="lg">
          Choose your card 👇
        </Text>
        <HStack gap={2}>
          {CARDS.map((card) => (
            <Box
              key={card}
              onClick={() => vote(card)}
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