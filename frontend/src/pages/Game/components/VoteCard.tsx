import {Box} from '@chakra-ui/react';

type VoteCardProps = {
  children?: React.ReactNode;
  selected?: boolean;
};

export function VoteCard({children, selected}: VoteCardProps) {
  return (
    <Box
      w='56px'
      h='80px'
      display='flex'
      alignItems='center'
      justifyContent='center'
      borderRadius='lg'
      borderWidth='2px'
      borderColor='blue.400'
      bg={selected ? 'blue.400' : 'white'}
      color={selected ? 'white' : 'blue.400'}
      fontSize='xl'
      fontWeight='bold'
      cursor='pointer'
      userSelect='none'
      shadow={selected ? 'lg' : 'none'}
      transform={selected ? 'translateY(-8px)' : 'translateY(0)'}
      transition='all 0.15s ease'
      _hover={{
        transform: selected ? 'translateY(-8px)' : 'translateY(-4px)',
        shadow: 'md',
      }}
    >
      {children}
    </Box>
  );
}
