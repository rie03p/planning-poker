import {Box, Container, Flex, Text} from '@chakra-ui/react';

export const Footer = () => (
  <Box bg='gray.50' color='gray.700' py={4} mt='auto' borderTopWidth='1px' borderColor='gray.200'>
    <Container maxW={'6xl'}>
      <Flex justify='center' align='center'>
        <Text fontSize={'sm'}>© {new Date().getFullYear()} All rights reserved.</Text>
      </Flex>
    </Container>
  </Box>
);
