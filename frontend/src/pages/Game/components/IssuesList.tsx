import {
  Drawer,
} from '@chakra-ui/react';
import {type Issue} from '@planning-poker/shared';
import {IssuesListContent} from './IssuesListContent';

type IssuesListProps = {
  isOpen: boolean;
  onClose: () => void;
  issues: Issue[];
  activeIssueId: string | undefined;
  onAddIssue: (title: string, description?: string, url?: string) => void;
  onRemoveIssue: (issueId: string) => void;
  onSetActiveIssue: (issueId: string) => void;
  onUpdateIssue: (id: string, title?: string, description?: string, url?: string) => void;
};

export function IssuesList({
  isOpen,
  onClose,
  issues,
  activeIssueId,
  onAddIssue,
  onRemoveIssue,
  onSetActiveIssue,
  onUpdateIssue,
}: IssuesListProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={event => {
      if (!event.open) {
        onClose();
      }
    }} size='md'>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Header borderBottomWidth='1px'>
            <Drawer.Title>Issues</Drawer.Title>
            <Drawer.CloseTrigger />
          </Drawer.Header>
          <Drawer.Body p={0}>
            <IssuesListContent
              issues={issues}
              activeIssueId={activeIssueId}
              onAddIssue={onAddIssue}
              onRemoveIssue={onRemoveIssue}
              onSetActiveIssue={onSetActiveIssue}
              onUpdateIssue={onUpdateIssue}
            />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
}
