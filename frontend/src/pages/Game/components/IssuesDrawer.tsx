import {Drawer} from '@chakra-ui/react';
import {type Issue} from '@planning-poker/shared';
import {IssuesListContent} from './IssuesListContent';

type IssuesDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  issues: Issue[];
  activeIssueId: string | undefined;
  onAddIssue: (title: string, description?: string, url?: string) => void;
  onRemoveIssue: (issueId: string) => void;
  onSetActiveIssue: (issueId: string) => void;
  onUpdateIssue: (issue: Issue) => void;
  onRemoveAllIssues: () => void;
};

export function IssuesDrawer({
  isOpen,
  onClose,
  issues,
  activeIssueId,
  onAddIssue,
  onRemoveIssue,
  onSetActiveIssue,
  onUpdateIssue,
  onRemoveAllIssues,
}: IssuesDrawerProps) {
  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={event => {
        if (!event.open) {
          onClose();
        }
      }}
      placement='end'
    >
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content rounded={{base: 'none', md: 'l-xl'}}>
          <IssuesListContent
            issues={issues}
            activeIssueId={activeIssueId}
            onAddIssue={onAddIssue}
            onRemoveIssue={onRemoveIssue}
            onSetActiveIssue={onSetActiveIssue}
            onUpdateIssue={onUpdateIssue}
            onRemoveAllIssues={onRemoveAllIssues}
            onClose={onClose}
          />
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
}
