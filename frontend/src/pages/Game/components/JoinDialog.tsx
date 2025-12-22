import {useState} from 'react';
import {
  Button, Dialog, Input, Field,
} from '@chakra-ui/react';
import {participantSchema} from '@planning-poker/shared';

type Props = {
  isOpen: boolean;
  onJoin: (name: string) => void;
};

export function JoinDialog({isOpen, onJoin}: Props) {
  const [draftName, setDraftName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleJoin = () => {
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      return;
    }

    const result = participantSchema.shape.name.safeParse(trimmedName);
    if (!result.success) {
      const firstError = result.error.errors[0];
      if (firstError?.code === 'too_small') {
        setError('Name must be at least 1 character');
      } else if (firstError?.code === 'too_big') {
        setError('Name must be at most 20 characters');
      } else {
        setError('Invalid name');
      }

      return;
    }

    setError('');
    onJoin(result.data);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleJoin();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDraftName(event.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Choose your display name</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <Field.Root invalid={Boolean(error)}>
              <Input
                placeholder='Your name'
                value={draftName}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              {error && <Field.ErrorText>{error}</Field.ErrorText>}
            </Field.Root>
          </Dialog.Body>

          <Dialog.Footer>
            <Button
              w='full'
              colorPalette='blue'
              disabled={!draftName.trim()}
              onClick={handleJoin}
            >
              Join game
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
