import {Box, HStack, Link, Menu, Text, Tooltip} from '@chakra-ui/react';
import {ExternalLink, Eye, Pencil, User} from 'lucide-react';
import {type Issue} from '@planning-poker/shared';
import {CopyInviteBox} from './CopyInviteBox';
import {IssuesMenuButton} from './IssuesMenuButton';

type GameHeaderProps = {
  gameId: string;
  activeIssueId: string | undefined;
  issues: Issue[];
  isIssuesOpen: boolean;
  onToggleIssues: () => void;
  isSpectator: boolean;
  onToggleSpectator: () => void;
  name: string;
  onChangeName: () => void;
};

export function GameHeader({
  gameId,
  activeIssueId,
  issues,
  isIssuesOpen,
  onToggleIssues,
  isSpectator,
  onToggleSpectator,
  name,
  onChangeName,
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

        <Box flex={1} justifyContent='center' minW={0} display={{base: 'none', md: 'flex'}}>
          {activeIssueId ? (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                {activeIssueUrl ? (
                  <Link
                    href={activeIssueUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    color='inherit'
                    _hover={{textDecoration: 'none'}}
                  >
                    <ActiveIssueBadge title={activeIssue?.title} />
                  </Link>
                ) : (
                  <ActiveIssueBadge title={activeIssue?.title} />
                )}
              </Tooltip.Trigger>
              <Tooltip.Positioner>
                <Tooltip.Content maxW='sm'>{activeIssue?.title}</Tooltip.Content>
              </Tooltip.Positioner>
            </Tooltip.Root>
          ) : (
            <Text color='gray.400' fontWeight='medium'>
              No active issue
            </Text>
          )}
        </Box>

        <HStack w={{base: 'auto', md: '200px'}} justify='flex-end' gap={2} flexShrink={0}>
          <Menu.Root positioning={{placement: 'bottom-end', offset: {mainAxis: 8}}}>
            <Menu.Trigger asChild>
              <Box
                as='button'
                aria-label='Player settings'
                title='Change name or spectator mode'
                p={2}
                borderRadius='md'
                bg={isSpectator ? 'purple.100' : 'gray.100'}
                color={isSpectator ? 'purple.600' : 'gray.600'}
                _hover={{bg: isSpectator ? 'purple.200' : 'gray.200'}}
                transition='all 0.2s'
                display='flex'
                alignItems='center'
                justifyContent='center'
              >
                {isSpectator ? <Eye size={20} /> : <User size={20} />}
              </Box>
            </Menu.Trigger>
            <Menu.Positioner zIndex='popover'>
              <Menu.Content p={2} borderRadius='xl' boxShadow='lg' minW='200px'>
                <Box px={3} py={2} borderBottomWidth='1px' borderColor='gray.100' mb={1}>
                  <Text fontSize='sm' color='gray.500'>
                    {name}
                  </Text>
                </Box>
                <Menu.Item value='change-name' gap={2} onClick={onChangeName}>
                  <Pencil size={16} />
                  Change name
                </Menu.Item>
                <Menu.Item value='toggle-spectator' gap={2} onClick={onToggleSpectator}>
                  {isSpectator ? <User size={16} /> : <Eye size={16} />}
                  {isSpectator ? 'Switch to Participant' : 'Switch to Spectator'}
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
          <CopyInviteBox gameId={gameId} />
          {/* SP: always show, PC: hide when panel is open (close button is in panel) */}
          <Box display={{base: 'block', md: isIssuesOpen ? 'none' : 'block'}}>
            <IssuesMenuButton isOpen={isIssuesOpen} onToggle={onToggleIssues} />
          </Box>
        </HStack>
      </HStack>
    </Box>
  );
}
