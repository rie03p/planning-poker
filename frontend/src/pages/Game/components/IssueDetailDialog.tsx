import {useState, useEffect} from 'react';
import {
  Button,
  Input,
  VStack,
  Text,
  Textarea,
  Dialog,
} from '@chakra-ui/react';
import {type Issue} from '@planning-poker/shared';

type IssueDetailDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  bg?: string; // Add bg prop to match Dialog.Content props if needed, though usually handled by theme
  issue: Issue | undefined;
  onUpdateIssue: (id: string, title?: string, description?: string, url?: string) => void;
};

export function IssueDetailDialog({
  isOpen,
  onClose,
  issue,
  onUpdateIssue,
}: IssueDetailDialogProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setUrl(issue.url ?? '');
      setDescription(issue.description ?? '');
    }
  }, [issue]);

  const handleSave = () => {
    if (issue && title.trim()) {
      onUpdateIssue(issue.id, title, description, url);
      onClose();
    }
  };

  if (!issue) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={event => {
      if (!event.open) {
        onClose();
      }
    }} placement='center'>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Edit Issue</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body>
            <VStack gap={4} align='stretch'>
              <VStack gap={1} align='stretch'>
                <Text fontWeight='medium' fontSize='sm'>Title</Text>
                <Input
                  value={title}
                  onChange={event => {
                    setTitle(event.target.value);
                  }}
                  placeholder='Issue title'
                />
              </VStack>

              <VStack gap={1} align='stretch'>
                <Text fontWeight='medium' fontSize='sm'>Link</Text>
                <Input
                  value={url}
                  onChange={event => {
                    setUrl(event.target.value);
                  }}
                  placeholder='Link URL (optional)'
                />
              </VStack>

              <VStack gap={1} align='stretch'>
                <Text fontWeight='medium' fontSize='sm'>Description</Text>
                <Textarea
                  value={description}
                  onChange={event => {
                    setDescription(event.target.value);
                  }}
                  placeholder='Add a description...'
                  rows={4}
                />
              </VStack>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant='outline' onClick={onClose}>Cancel</Button>
            </Dialog.ActionTrigger>
            <Button colorPalette='blue' onClick={handleSave}>Save</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
