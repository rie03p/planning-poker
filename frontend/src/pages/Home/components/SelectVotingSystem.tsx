import {
  Menu,
  Button,
  Text,
  VStack,
} from '@chakra-ui/react';
import {ChevronDown} from 'lucide-react';

export type VotingSystemOption = {
  id: string;
  label: string;
};

const DEFAULT_OPTIONS: VotingSystemOption[] = [
  {id: 'fibonacci', label: 'Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕)'},
  {id: 'modified-fibonacci', label: 'Modified Fibonacci ( 0, ½, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?, ☕ )'},
  {id: 't-shirts', label: 'T-shirts (XS, S, M, L, XL, ?, ☕ )'},
  {id: 'powers-of-2', label: 'Powers of 2 ( 0, 1, 2, 4, 8, 16, 32, 64, ?, ☕ )'},
];

type Props = {
  value: string;
  onChange: (id: string) => void;
  options?: VotingSystemOption[];
};

export function SelectVotingSystem({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
}: Props) {
  const selectedOption
    = options.find(o => o.id === value) ?? options[0];

  return (
    <Menu.Root positioning={{sameWidth: true}}>
      <Menu.Trigger asChild>
        <Button
          variant='outline'
          w='full'
          justifyContent='space-between'
          paddingEnd={2}
          textAlign='left'
        >
          <VStack align='start' gap={0} flex='1' overflow='hidden' minW={0}>
            <Text fontSize='sm' color='gray.500'>
              Voting system
            </Text>
            <Text
              width='100%'
              fontWeight='semibold'
              truncate
            >
              {selectedOption.label}
            </Text>
          </VStack>
          <ChevronDown size={16} />
        </Button>
      </Menu.Trigger>

      <Menu.Positioner>
        <Menu.Content maxH='240px' overflowY='auto'>
          {options.map(opt => (
            <Menu.Item
              key={opt.id}
              value={opt.id}
              onClick={() => {
                onChange(opt.id);
              }}
            >
              {opt.label}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}
