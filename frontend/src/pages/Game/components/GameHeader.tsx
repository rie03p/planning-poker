import {
  Box, HStack, Text, Badge, Tooltip,
} from '@chakra-ui/react';
import {type Issue} from '@planning-poker/shared';
import {CopyInviteBox} from './CopyInviteBox';
import {IssuesMenuButton} from './IssuesMenuButton';

type GameHeaderProps = {
  gameId: string;
  activeIssueId: string | undefined;
  issues: Issue[];
  isIssuesOpen: boolean;
  onToggleIssues: () => void;
};

export function GameHeader({
  gameId,
  activeIssueId,
  issues,
  isIssuesOpen,
  onToggleIssues,
}: GameHeaderProps) {
  return (
    <Box
      w='full'
      bg='white'
      borderBottomWidth='1px'
      borderColor='gray.200'
      px={6}
      py={3}
      shadow='sm'
    >
      <HStack justify='space-between' h='40px' gap={4}>
        <Box w='200px' flexShrink={0}>
          <Text fontSize='xl' fontWeight='bold' color='blue.600'>
            Planning Poker
          </Text>
        </Box>

        <Box
          flex={1}
          justifyContent='center'
          minW={0}
          display={{base: 'none', md: 'flex'}}
        >
          {activeIssueId
            ? (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <HStack
                    gap={3}
                    bg='blue.50'
                    px={4}
                    py={2}
                    borderRadius='full'
                    borderWidth='1px'
                    borderColor='blue.200'
                    maxW='100%'
                    cursor='default'
                  >
                    <Text fontWeight='medium' truncate>
                      {issues.find(i => i.id === activeIssueId)?.title}
                    </Text>
                  </HStack>
                </Tooltip.Trigger>
                <Tooltip.Positioner>
                  <Tooltip.Content maxW='sm'>
                    {issues.find(i => i.id === activeIssueId)?.title}
                  </Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>
            )
            : (
              <Text color='gray.400' fontWeight='medium'>
                No active issue
              </Text>
            )}
        </Box>

        <HStack w='200px' justify='flex-end' gap={2} flexShrink={0}>
          <CopyInviteBox gameId={gameId} />
          <IssuesMenuButton isOpen={isIssuesOpen} onToggle={onToggleIssues} />
        </HStack>
      </HStack>
    </Box>
  );
}
