import {Component, type ReactNode, type ErrorInfo} from 'react';
import {VStack, Text, Button, Box} from '@chakra-ui/react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

/**
 * Error Boundary component to catch and handle React component errors
 * Provides a fallback UI when errors occur in the component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {hasError: true, error};
  }

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {hasError: false, error: undefined};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({hasError: false, error: undefined});
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <VStack minH='100vh' justify='center' align='center' gap={4} p={4}>
          <Box textAlign='center'>
            <Text fontSize='2xl' fontWeight='bold' mb={2}>
              問題が発生しました
            </Text>
            <Text color='gray.600' mb={4}>
              アプリケーションでエラーが発生しました。
            </Text>
            {import.meta.env.DEV && this.state.error && (
              <Box
                mt={4}
                p={4}
                bg='red.50'
                borderRadius='md'
                borderWidth='1px'
                borderColor='red.200'
                textAlign='left'
                maxW='600px'
              >
                <Text fontSize='sm' fontFamily='mono' color='red.600'>
                  {this.state.error.message}
                </Text>
                <Text fontSize='xs' fontFamily='mono' color='red.500' mt={2} whiteSpace='pre-wrap'>
                  {this.state.error.stack}
                </Text>
              </Box>
            )}
          </Box>
          <Button colorScheme='blue' onClick={this.handleReset}>
            再試行
          </Button>
        </VStack>
      );
    }

    return this.props.children;
  }
}
