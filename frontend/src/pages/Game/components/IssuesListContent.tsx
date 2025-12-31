import {useState} from 'react';
import {
  VStack,
  HStack,
  Text,
  Input,
  Button,
  IconButton,
  Card,
  Link,
  Box,
  CloseButton,
  Dialog,
} from '@chakra-ui/react';
import {
  Plus, Trash2, ExternalLink, BarChart3,
} from 'lucide-react';
import {type Issue, MAX_ISSUES} from '@planning-poker/shared';
import {IssueDetailDialog} from './IssueDetailDialog';
import {VotingResultsModal} from './VotingResultsModal';

type IssuesListContentProps = {
  issues: Issue[];
  activeIssueId: string | undefined;
  onAddIssue: (title: string) => void;
  onRemoveIssue: (issueId: string) => void;
  onSetActiveIssue: (issueId: string) => void;
  onUpdateIssue: (issue: Issue) => void;
  onClose?: () => void;
};

export function IssuesListContent({
  issues,
  activeIssueId,
  onAddIssue,
  onRemoveIssue,
  onSetActiveIssue,
  onUpdateIssue,
  onClose,
}: IssuesListContentProps) {
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [editingIssue, setEditingIssue] = useState<Issue | undefined>(undefined);
  const [deletingIssueId, setDeletingIssueId] = useState<string | undefined>(undefined);
  const [viewingResultsIssue, setViewingResultsIssue] = useState<Issue | undefined>(undefined);

  const handleAddIssue = () => {
    if (!newIssueTitle.trim()) {
      return;
    }

    onAddIssue(newIssueTitle);
    setNewIssueTitle('');
  };

  const confirmDelete = () => {
    if (deletingIssueId) {
      onRemoveIssue(deletingIssueId);
      setDeletingIssueId(undefined);
    }
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
        {onClose && <CloseButton onClick={onClose} />}
      </HStack>

      {/* Add Issue Form - Fixed at top */}
      <VStack gap={3} align='stretch' p={4} borderBottomWidth='1px' bg='white'>
        <Text fontWeight='bold'>Add new issue</Text>
        {issues.length >= MAX_ISSUES && (
          <Text color='red.500' fontSize='sm'>
            Maximum of {MAX_ISSUES} issues reached. Please remove some issues before adding more.
          </Text>
        )}
        <HStack>
          <Input
            placeholder='Issue title'
            value={newIssueTitle}
            onChange={event => {
              setNewIssueTitle(event.target.value);
            }}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                handleAddIssue();
              }
            }}
            disabled={issues.length >= MAX_ISSUES}
          />
          <Button
            colorPalette='blue'
            onClick={handleAddIssue}
            disabled={!newIssueTitle.trim() || issues.length >= MAX_ISSUES}
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
