import {Box} from '@chakra-ui/react';
import {type Issue} from '@planning-poker/shared';
import {IssuesListContent} from './IssuesListContent';

type IssuesPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  issues: Issue[];
  activeIssueId: string | undefined;
  onAddIssue: (title: string, description?: string, url?: string) => void;
  onRemoveIssue: (issueId: string) => void;
  onSetActiveIssue: (issueId: string) => void;
  onUpdateIssue: (issue: Issue) => void;
  onRemoveAllIssues: () => void;
  cards?: readonly string[];
};

export function IssuesPanel({
  isOpen,
  onClose,
  issues,
  activeIssueId,
  onAddIssue,
  onRemoveIssue,
  onSetActiveIssue,
  onUpdateIssue,
  onRemoveAllIssues,
  cards,
}: IssuesPanelProps) {
  return (
    <Box
      display={{base: 'none', md: 'flex'}}
      h='100vh'
      flexShrink={0}
    >
      {/* Panel Content */}
      <Box
        w={isOpen ? '380px' : '0px'}
        overflow='hidden'
        transition='width 0.3s ease'
        borderLeftWidth={isOpen ? '1px' : '0'}
        borderColor='gray.200'
        bg='white'
        h='100%'
      >
        <Box w='380px' h='100%'>
          <IssuesListContent
            issues={issues}
            activeIssueId={activeIssueId}
            onAddIssue={onAddIssue}
            onRemoveIssue={onRemoveIssue}
            onSetActiveIssue={onSetActiveIssue}
            onUpdateIssue={onUpdateIssue}
            onRemoveAllIssues={onRemoveAllIssues}
            onClose={onClose}
            cards={cards}
          />
        </Box>
      </Box>
    </Box>
  );
}
