import {Dialog, Box} from '@chakra-ui/react';
import {type Issue} from '@planning-poker/shared';
import {VotingResultsChart} from './VotingResultsChart';

type VotingResultsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | undefined;
  cards?: readonly string[];
};

export function VotingResultsModal({isOpen, onClose, issue, cards}: VotingResultsModalProps) {
  if (!issue?.voteResults) {
    return null;
  }

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(event: {open: boolean}) => {
        if (!event.open) {
          onClose();
        }
      }}
      placement='center'
      size='md'
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title wordBreak='break-word' overflowWrap='break-word'>
              {issue.title}
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Box py={2}>
              <VotingResultsChart voteResults={issue.voteResults} cards={cards} />
            </Box>
          </Dialog.Body>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
