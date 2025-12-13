import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Flex, Heading, VStack } from '@chakra-ui/react'
import { SelectVotingSystem } from './components/SelectVotingSystem'

export function Home() {
  const navigate = useNavigate()
  const [votingSystem, setVotingSystem] = useState<string | undefined>(undefined)

  const handleCreateRoom = () => {
    // TODO: generate room ID properly
    const newRoomId = 'generated-room-id'
    const q = votingSystem ? `?v=${encodeURIComponent(votingSystem)}` : ''
    navigate(`/${newRoomId}${q}`)
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <VStack gap={6} w="full" maxW="500px" px={4}>
        <Heading size="xl">Planning Poker</Heading>

        <SelectVotingSystem
          value={votingSystem}
          onChange={(id) => setVotingSystem(id)}
        />

        <Button
          colorScheme="blue"
          size="lg"
          w="full"
          onClick={handleCreateRoom}
          disabled={!votingSystem}
        >
          Start new game
        </Button>
      </VStack>
    </Flex>
  )
}