import {useState} from 'react';
import {Drawer, useBreakpointValue} from '@chakra-ui/react';
import {IssuesListContent, type IssuesListContentProps} from './IssuesListContent';

type IssuesDrawerProps = Omit<IssuesListContentProps, 'onDraggingChange'> & {
  isOpen: boolean;
  onClose: () => void;
  isMobileOnly?: boolean;
};

export function IssuesDrawer({
  isOpen,
  onClose,
  isMobileOnly = false,
  ...contentProps
}: IssuesDrawerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isMobile = useBreakpointValue({base: true, md: false}, {ssr: false});

  // On desktop, don't show the drawer when isMobileOnly is true
  if (isMobileOnly && !isMobile) {
    return null;
  }

  return (
    <Drawer.Root
      open={isOpen}
      closeOnEscape={!isDragging}
      closeOnInteractOutside={!isDragging}
      onOpenChange={event => {
        if (!event.open) {
          onClose();
        }
      }}
      placement='end'
    >
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content rounded='none'>
          <IssuesListContent {...contentProps} onClose={onClose} onDraggingChange={setIsDragging} />
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
}
