import {IconButton, Tooltip} from '@chakra-ui/react';
import {Menu} from 'lucide-react';

type IssuesMenuButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function IssuesMenuButton({isOpen, onToggle}: IssuesMenuButtonProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <IconButton
          onClick={onToggle}
          variant={isOpen ? 'solid' : 'outline'}
          colorPalette='gray'
          aria-label='Toggle issues menu'
        >
          <Menu size={16} />
        </IconButton>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>Issues</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
}
