import {useState, useRef} from 'react';
import {Button, Input, VStack, Text, Textarea, Dialog, Field} from '@chakra-ui/react';
import {type Issue, issueSchema} from '@planning-poker/shared';

type IssueDetailDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  bg?: string; // Add bg prop to match Dialog.Content props if needed, though usually handled by theme
  issue: Issue | undefined;
  onUpdateIssue: (issue: Issue) => void;
};

export function IssueDetailDialog({isOpen, onClose, issue, onUpdateIssue}: IssueDetailDialogProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{title?: string; url?: string; description?: string}>({});
  const previousIssueIdRef = useRef<string | undefined>(undefined);

  if (issue?.id !== previousIssueIdRef.current) {
    previousIssueIdRef.current = issue?.id;
    if (issue) {
      setTitle(issue.title);
      setUrl(issue.url ?? '');
      setDescription(issue.description ?? '');
      setErrors({});
    }
  }

  const validateFields = () => {
    if (!issue) {
      return false;
    }

    const result = issueSchema.safeParse({
      id: issue.id,
      title,
      description,
      url,
    });

    if (!result.success) {
      const newErrors: {title?: string; url?: string; description?: string} = {};
      for (const error of result.error.errors) {
        const field = error.path[0] as 'title' | 'url' | 'description';
        if (field === 'title' || field === 'url' || field === 'description') {
          newErrors[field] = error.message;
        }
      }

      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSave = () => {
    if (!validateFields()) {
      return;
    }

    if (issue) {
      onUpdateIssue({
        id: issue.id,
        title,
        description,
        url,
      });
      onClose();
    }
  };

  if (!issue) {
    return null;
  }

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={event => {
        if (!event.open) {
          onClose();
        }
      }}
      placement='center'
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Edit Issue</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body>
            <VStack gap={4} align='stretch'>
              <Field.Root invalid={errors.title ? true : undefined}>
                <Field.Label fontWeight='medium' fontSize='sm'>
                  Title
                </Field.Label>
                <Input
                  value={title}
                  onChange={event => {
                    setTitle(event.target.value);
                    if (errors.title) {
                      setErrors({...errors, title: undefined});
                    }
                  }}
                  placeholder='Issue title'
                />
                <Text fontSize='xs' color='gray.500'>
                  {title.length}/100
                </Text>
                {errors.title && <Field.ErrorText>{errors.title}</Field.ErrorText>}
              </Field.Root>

              <Field.Root invalid={errors.url ? true : undefined}>
                <Field.Label fontWeight='medium' fontSize='sm'>
                  Link
                </Field.Label>
                <Input
                  value={url}
                  onChange={event => {
                    setUrl(event.target.value);
                    if (errors.url) {
                      setErrors({...errors, url: undefined});
                    }
                  }}
                  placeholder='Link URL (optional)'
                />
                <Text fontSize='xs' color='gray.500'>
                  {url.length}/200
                </Text>
                {errors.url && <Field.ErrorText>{errors.url}</Field.ErrorText>}
              </Field.Root>

              <Field.Root invalid={errors.description ? true : undefined}>
                <Field.Label fontWeight='medium' fontSize='sm'>
                  Description
                </Field.Label>
                <Textarea
                  value={description}
                  onChange={event => {
                    setDescription(event.target.value);
                    if (errors.description) {
                      setErrors({...errors, description: undefined});
                    }
                  }}
                  placeholder='Add a description...'
                  rows={4}
                />
                <Text fontSize='xs' color='gray.500'>
                  {description.length}/1000
                </Text>
                {errors.description && <Field.ErrorText>{errors.description}</Field.ErrorText>}
              </Field.Root>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant='outline' onClick={onClose}>
                Cancel
              </Button>
            </Dialog.ActionTrigger>
            <Button colorPalette='blue' onClick={handleSave}>
              Save
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
