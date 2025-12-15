import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Button, Flex, Heading, Text, VStack,
} from '@chakra-ui/react';
import {SelectVotingSystem} from './components/SelectVotingSystem';

const BACKEND_URL: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8787';

export function Home() {
  const navigate = useNavigate();
  const [votingSystem, setVotingSystem] = useState<string>('tshirts');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleCreateGame = async () => {
    setIsCreating(true);
    try {
      const response = await fetch(`${BACKEND_URL}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({votingSystem}),
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      const {gameId} = await response.json();
      navigate(`/${gameId}`);
    } catch (error) {
      console.error('Error creating game:', error);
      setError('Failed to create game. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Flex minH='100vh' align='center' justify='center' bg='gray.50'>
      <VStack gap={6} w='full' maxW='500px' px={4}>
        <Heading size='xl'>Planning Poker</Heading>

        <SelectVotingSystem
          value={votingSystem}
          onChange={id => {
            setVotingSystem(id);
          }}
        />

        <Button
          colorPalette='blue'
          size='lg'
          w='full'
          onClick={handleCreateGame}
          disabled={!votingSystem || isCreating}
          loading={isCreating}
        >
          Start new game
        </Button>
        {error && (
          <Text color='red.500'>
            {error}
          </Text>
        )}
      </VStack>
    </Flex>
  );
}
