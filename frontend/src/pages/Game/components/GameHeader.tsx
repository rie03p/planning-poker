import {
  Box, HStack, Link, Text, Tooltip,
} from '@chakra-ui/react';
import {ExternalLink} from 'lucide-react';
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
  const activeIssue = issues.find(issue => issue.id === activeIssueId);
  const activeIssueUrl = activeIssue?.url?.trim();
  const ActiveIssueBadge = ({title}: {title: string | undefined}) => (
    <HStack
      gap={activeIssueUrl ? 2 : 3}
      bg='blue.50'
      px={4}
      py={2}
      borderRadius='full'
      borderWidth='1px'
      borderColor='blue.200'
      maxW='100%'
      cursor={activeIssueUrl ? 'pointer' : 'default'}
      _hover={activeIssueUrl ? {bg: 'blue.100', borderColor: 'blue.300'} : undefined}
      transition={activeIssueUrl ? 'background 0.2s ease, border-color 0.2s ease' : undefined}
    >
      <Text fontWeight='medium' truncate>
        {title}
      </Text>
      {activeIssueUrl && <ExternalLink size={14} />}
    </HStack>
  );

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
        <Box w={{base: 'auto', md: '200px'}} flexShrink={0}>
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
                  {activeIssueUrl
                    ? (
                      <Link
                        href={activeIssueUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        color='inherit'
                        _hover={{textDecoration: 'none'}}
                      >
                        <ActiveIssueBadge title={activeIssue?.title} />
                      </Link>
                    )
                    : (
                      <ActiveIssueBadge title={activeIssue?.title} />
                    )}
                </Tooltip.Trigger>
                <Tooltip.Positioner>
                  <Tooltip.Content maxW='sm'>
                    {activeIssue?.title}
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

        <HStack w={{base: 'auto', md: '200px'}} justify='flex-end' gap={2} flexShrink={0}>
          <CopyInviteBox gameId={gameId} />
          <IssuesMenuButton isOpen={isIssuesOpen} onToggle={onToggleIssues} />
        </HStack>
      </HStack>
    </Box>
  );
}
