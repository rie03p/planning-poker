import {useState} from 'react';
import {
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  IconButton,
  Card,
  Link,
  Box,
  CloseButton,
  Dialog,
  Menu,
  Portal,
} from '@chakra-ui/react';
import {
  Plus, Trash2, ExternalLink, BarChart3, MoreHorizontal,
} from 'lucide-react';
import {type Issue, MAX_ISSUES} from '@planning-poker/shared';
import {IssueDetailDialog} from './IssueDetailDialog';
import {VotingResultsModal} from './VotingResultsModal';

type IssuesListContentProps = {
  issues: Issue[];
  activeIssueId: string | undefined;
  onAddIssue: (title: string, description?: string, url?: string) => void;
  onRemoveIssue: (issueId: string) => void;
  onSetActiveIssue: (issueId: string) => void;
  onUpdateIssue: (issue: Issue) => void;
  onRemoveAllIssues: () => void;
  onClose?: () => void;
};

export function IssuesListContent({
  issues,
  activeIssueId,
  onAddIssue,
  onRemoveIssue,
  onSetActiveIssue,
  onUpdateIssue,
  onRemoveAllIssues,
  onClose,
}: IssuesListContentProps) {
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [editingIssue, setEditingIssue] = useState<Issue | undefined>(undefined);
  const [deletingIssueId, setDeletingIssueId] = useState<string | undefined>(undefined);
  const [viewingResultsIssue, setViewingResultsIssue] = useState<Issue | undefined>(undefined);
  const [isdeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  const handleAddIssue = () => {
    if (!newIssueTitle.trim()) {
      return;
    }

    // Parse input for multiple issues
    const input = newIssueTitle.trim();

    // Check if input contains markdown links (Linear format)
    const markdownLinkRegex = /^-\s*\[([^\]]+)]\(([^)]+)\)\s*$/;
    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Check if all lines are markdown links
    const allMarkdownLinks = lines.length > 0 && lines.every(line => markdownLinkRegex.test(line));

    if (allMarkdownLinks) {
      // Parse markdown links and add multiple issues with URLs
      for (const line of lines) {
        const match = markdownLinkRegex.exec(line);
        if (match) {
          const title = match[1];
          const url = match[2];
          // Extract just the title without the prefix (e.g., "SRS-1947: ")
          const cleanTitle = title.replace(/^[A-Z]+-\d+:\s*/, '').trim().slice(0, 100);
          onAddIssue(cleanTitle, undefined, url);
        }
      }
    } else if (lines.length > 1) {
      // Multiple plain lines - add each as a separate issue
      for (const line of lines) {
        if (line) {
          const trimmedLine = line.slice(0, 100);
          onAddIssue(trimmedLine);
        }
      }
    } else {
      // Single issue
      const trimmedInput = input.slice(0, 100);
      onAddIssue(trimmedInput);
    }

    setNewIssueTitle('');
  };

  const confirmDelete = () => {
    if (deletingIssueId) {
      onRemoveIssue(deletingIssueId);
      setDeletingIssueId(undefined);
    }
  };

  const confirmDeleteAll = () => {
    onRemoveAllIssues();
    setIsDeleteAllDialogOpen(false);
  };

  return (
    <Box height='100%' display='flex' flexDirection='column' bg='white'>
      {/* Header */}
      <HStack
        p={4}
        borderBottomWidth='1px'
        justify='space-between'
        align='center'
        bg='white'
      >
        <Text fontWeight='bold' fontSize='lg'>
          Issues ({issues.length}/{MAX_ISSUES})
        </Text>
        <HStack gap={2}>
          {issues.length > 0 && (
            <Menu.Root positioning={{placement: 'bottom-end', offset: {mainAxis: 8}}}>
              <Menu.Trigger asChild>
                <IconButton
                  aria-label='Options'
                  variant='ghost'
                  size='sm'
                  colorPalette='gray'
                >
                  <MoreHorizontal />
                </IconButton>
              </Menu.Trigger>
              <Menu.Positioner zIndex='popover'>
                <Menu.Content
                  p={2}
                  borderRadius='xl'
                  boxShadow='lg'
                  minW='220px'
                >
                  <Menu.Item
                    value='delete-all'
                    color='red.500'
                    gap={2}
                    _hover={{bg: 'red.50', color: 'red.600'}}
                    onClick={() => {
                      setIsDeleteAllDialogOpen(true);
                    }}
                  >
                    <Trash2 size={16} />
                    Delete all issues
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          )}
          {onClose && <CloseButton onClick={onClose} />}
        </HStack>
      </HStack>

      {/* Add Issue Form - Fixed at top */}
      <VStack gap={3} align='stretch' p={4} borderBottomWidth='1px' bg='white'>
        <Text fontWeight='bold'>Add new issue</Text>
        <Text fontSize='xs' color='gray.600'>
          You can add multiple issues at once by entering them on separate lines.
          Supports Linear markdown links format.
        </Text>
        {issues.length >= MAX_ISSUES && (
          <Text color='red.500' fontSize='sm'>
            Maximum of {MAX_ISSUES} issues reached. Please remove some issues before adding more.
          </Text>
        )}
        <HStack align='start'>
          <Textarea
            placeholder='Issue title (supports multiple lines and Linear markdown format)'
            value={newIssueTitle}
            onChange={event => {
              setNewIssueTitle(event.target.value);
            }}
            onKeyDown={event => {
              if (event.key === 'Enter' && event.metaKey && !event.nativeEvent.isComposing) {
                handleAddIssue();
              }
            }}
            disabled={issues.length >= MAX_ISSUES}
            rows={3}
          />
          <Button
            colorPalette='blue'
            onClick={handleAddIssue}
            disabled={!newIssueTitle.trim() || issues.length >= MAX_ISSUES}
            flexShrink={0}
          >
            <Plus size={16} />
          </Button>
        </HStack>
      </VStack>

      {/* Scrollable Issues List */}
      <Box flex={1} overflowY='auto' p={4}>
        <VStack gap={3} align='stretch'>
          {issues.length === 0
            ? (
              <Text color='gray.500' textAlign='center' py={4}>
                No issues registered yet.
              </Text>
            )
            : (
              issues.map(issue => {
                const isActive = issue.id === activeIssueId;
                return (
                  <Card.Root
                    key={issue.id}
                    variant={isActive ? 'subtle' : 'outline'}
                    colorPalette={isActive ? 'blue' : undefined}
                    onClick={() => {
                      setEditingIssue(issue);
                    }}
                    cursor='pointer'
                    _hover={{borderColor: 'blue.400'}}
                  >
                    <Card.Body p={3}>
                      <VStack align='stretch' gap={2}>
                        <HStack justify='space-between' align='center'>
                          <Text fontWeight='medium' truncate flex={1}>
                            {issue.title}
                          </Text>
                          {issue.voteResults && Object.keys(issue.voteResults).length > 0 && (
                            <IconButton
                              aria-label='View voting results'
                              size='sm'
                              colorPalette='blue'
                              variant='ghost'
                              onClick={event => {
                                event.stopPropagation();
                                setViewingResultsIssue(issue);
                              }}
                            >
                              <BarChart3 size={16} />
                            </IconButton>
                          )}
                          <IconButton
                            aria-label='Remove issue'
                            size='sm'
                            colorPalette='red'
                            variant='ghost'
                            onClick={event => {
                              event.stopPropagation();
                              setDeletingIssueId(issue.id);
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </HStack>

                        {issue.url && (
                          <Link
                            href={issue.url}
                            target='_blank'
                            fontSize='sm'
                            colorPalette='blue'
                            onClick={event => {
                              event.stopPropagation();
                            }}
                            width='fit-content'
                          >
                            <HStack gap={1}>
                              <Text maxW='200px' truncate>
                                {issue.url}
                              </Text>
                              <ExternalLink
                                size={14}
                                style={{margin: '0 2px'}}
                              />
                            </HStack>
                          </Link>
                        )}

                        <Box pt={2} onClick={event => {
                          event.stopPropagation();
                        }}>
                          {isActive
                            ? (
                              <Button
                                size='sm'
                                colorPalette='blue'
                                width='full'
                                variant='solid'
                                disabled
                                _disabled={{opacity: 1, cursor: 'default'}}
                              >
                                Voting now...
                              </Button>
                            )
                            : (
                              <Button
                                size='sm'
                                variant='subtle'
                                width='full'
                                onClick={() => {
                                  onSetActiveIssue(issue.id);
                                }}
                              >
                                Vote this issue
                              </Button>
                            )}
                        </Box>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                );
              })
            )}
        </VStack>
      </Box>

      {/* Edit Dialog */}
      <IssueDetailDialog
        isOpen={Boolean(editingIssue)}
        onClose={() => {
          setEditingIssue(undefined);
        }}
        issue={editingIssue}
        onUpdateIssue={onUpdateIssue}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={Boolean(deletingIssueId)}
        onOpenChange={event => {
          if (!event.open) {
            setDeletingIssueId(undefined);
          }
        }}
        placement='center'
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Delete Issue</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                Are you sure you want to delete this issue? This action cannot be
                undone.
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setDeletingIssueId(undefined);
                    }}
                  >
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button colorPalette='red' onClick={confirmDelete}>
                  Delete
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete All Confirmation Dialog */}
      <Dialog.Root
        open={isdeleteAllDialogOpen}
        onOpenChange={event => {
          setIsDeleteAllDialogOpen(event.open);
        }}
        placement='center'
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Delete All Issues</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                Are you sure you want to delete ALL issues? This action cannot be
                undone.
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsDeleteAllDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button colorPalette='red' onClick={confirmDeleteAll}>
                  Delete All
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Voting Results Modal */}
      <VotingResultsModal
        isOpen={Boolean(viewingResultsIssue)}
        onClose={() => {
          setViewingResultsIssue(undefined);
        }}
        issue={viewingResultsIssue}
      />
    </Box>
  );
}
