import {
  Button, Heading, Text, VStack,
} from '@chakra-ui/react';
import {useNavigate} from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <VStack
      minH='100vh'
      justify='center'
      align='center'
      gap={5}
      textAlign='center'
      px={4}
    >
      <Heading size='4xl'>404</Heading>

      <Heading size='md'>
        Page not found
      </Heading>

      <Text color='gray.500'>
        The page you are looking for doesn’t exist.
      </Text>

      <Button
        onClick={() => navigate('/')}
      >
        Back to Home
      </Button>
    </VStack>
  );
}
