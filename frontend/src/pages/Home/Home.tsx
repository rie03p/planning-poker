import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Flex, Heading, VStack } from '@chakra-ui/react'
import { SelectVotingSystem } from './components/SelectVotingSystem'

export function Home() {
  const navigate = useNavigate()
  const [votingSystem, setVotingSystem] = useState<string>('tshirts')

  const handleCreateGame = () => {
    // TODO: generate game ID properly
    const newGameId = 'generated-game-id'
    const q = votingSystem ? `?v=${encodeURIComponent(votingSystem)}` : ''
    navigate(`/${newGameId}${q}`)
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
          colorPalette="blue"
          size="lg"
          w="full"
          onClick={handleCreateGame}
          disabled={!votingSystem}
        >
          Start new game
        </Button>
      </VStack>
    </Flex>
  )
}