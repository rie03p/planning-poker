import {VStack, Text, Button} from '@chakra-ui/react';

type ErrorMessageProps = {
  title: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

/**
 * Error message component with optional retry button
 */
export function ErrorMessage({
  title,
  message,
  onRetry,
  retryLabel = '再試行',
}: ErrorMessageProps) {
  return (
    <VStack minH='100vh' justify='center' align='center' gap={4} p={4}>
      <Text fontSize='2xl' fontWeight='bold'>
        {title}
      </Text>
      {message && (
        <Text color='gray.600' textAlign='center'>
          {message}
        </Text>
      )}
      {onRetry && (
        <Button colorPalette='blue' onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </VStack>
  );
}

