import {
  Box, Container, Flex, Heading, Link, Spacer,
} from '@chakra-ui/react';
import github from '../assets/github.svg';

export const Header = () => (
  <Box
    as='header'
    bg='white'
    borderBottomWidth='1px'
    borderColor='gray.200'
    py={4}
    position='sticky'
    top={0}
    zIndex='sticky'
  >
    <Container maxW='6xl'>
      <Flex align='center'>
        <Heading as='h1' size='lg'>
          Planning Poker
        </Heading>

        <Spacer />

        <Link
          href='https://github.com/rie03p/planning-poker'
          target='_blank'
          rel='noopener noreferrer'
          display='flex'
          alignItems='center'
          gap={2}
          _hover={{textDecoration: 'none', opacity: 0.7}}
          transition='opacity 0.2s'
        >
          <img src={github} alt='GitHub' width='24' height='24' />
          GitHub
        </Link>
      </Flex>
    </Container>
  </Box>
);
