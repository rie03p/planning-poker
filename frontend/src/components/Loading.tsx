import {VStack, Text, Spinner} from '@chakra-ui/react';

type LoadingProps = {
  message?: string;
};

/**
 * Loading component with spinner and optional message
 */
export function Loading({message = 'Loading...'}: LoadingProps) {
  return (
    <VStack minH='100vh' justify='center' align='center' gap={4}>
      <Spinner size='xl' color='blue.500' />
      <Text color='gray.600'>{message}</Text>
    </VStack>
  );
}
