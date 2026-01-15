import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Button, Flex, Text, VStack,
} from '@chakra-ui/react';
import {createGameResponseSchema} from '@planning-poker/shared';
import {BACKEND_URL, DEFAULT_VOTING_SYSTEM} from '../../config/constants';
import {SelectVotingSystem} from './components/SelectVotingSystem';

export function Home() {
  const navigate = useNavigate();
  const [votingSystem, setVotingSystem] = useState<string>(DEFAULT_VOTING_SYSTEM);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleCreateGame = async () => {
    setIsCreating(true);
    setError(undefined);
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

      const data = await response.json();
      const result = createGameResponseSchema.safeParse(data);

      if (!result.success) {
        throw new Error('Invalid response from server');
      }

      navigate(`/${result.data.gameId}`);
    } catch (error_) {
      console.error('Error creating game:', error_);
      setError('Failed to create game. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Flex flex='1' w='full' align='center' justify='center' bg='gray.50'>
      <VStack gap={6} w='full' maxW='500px' px={4}>
        <SelectVotingSystem
          value={votingSystem}
          onChange={id => {
            setVotingSystem(id);
          }}
        />

        <Button
          colorScheme='blue'
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
