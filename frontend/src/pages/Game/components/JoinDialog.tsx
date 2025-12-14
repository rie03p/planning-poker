import {useState} from 'react';
import {Button, Dialog, Input} from '@chakra-ui/react';

type Props = {
  isOpen: boolean;
  onJoin: (name: string) => void;
};

export function JoinDialog({isOpen, onJoin}: Props) {
  const [draftName, setDraftName] = useState<string>('');

  const handleJoin = () => {
    if (draftName.trim()) {
      onJoin(draftName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoin();
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
            <Input
              placeholder='Your name'
              value={draftName}
              onChange={e => {
                setDraftName(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              autoFocus
            />
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
