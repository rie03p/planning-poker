import {Box} from '@chakra-ui/react';
import {IssuesListContent, type IssuesListContentProps} from './IssuesListContent';

type IssuesPanelProps = Omit<IssuesListContentProps, 'onDraggingChange'> & {
  isOpen: boolean;
  onClose: () => void;
};

export function IssuesPanel({isOpen, ...contentProps}: IssuesPanelProps) {
  return (
    <Box display={{base: 'none', md: 'flex'}} h='100vh' flexShrink={0}>
      {/* Panel Content */}
      <Box
        inert={!isOpen}
        w={isOpen ? '380px' : '0px'}
        overflow='hidden'
        transition='width 0.3s ease'
        borderLeftWidth={isOpen ? '1px' : '0'}
        borderColor='gray.200'
        bg='white'
        h='100%'
      >
        <Box w='380px' h='100%'>
          <IssuesListContent {...contentProps} />
        </Box>
      </Box>
    </Box>
  );
}
