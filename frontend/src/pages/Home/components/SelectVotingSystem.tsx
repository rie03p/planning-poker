import {
  Menu,
  Button,
  Box,
  Text,
  VStack,
} from '@chakra-ui/react'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

export type VotingSystemOption = {
  id: string
  label: string
}

const DEFAULT_OPTIONS: VotingSystemOption[] = [
  { id: 'fibonacci', label: 'Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕)' },
  { id: 'modified-fibonacci', label: 'Modified Fibonacci' },
  { id: 'tshirts', label: 'T-shirts' },
  { id: 'powers-of-2', label: 'Powers of 2' },
]

type Props = {
  value?: string
  onChange?: (id: string) => void
  options?: VotingSystemOption[]
}

export function SelectVotingSystem({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
}: Props) {
  const [selected, setSelected] = useState(
    value ?? options[0].id
  )

  useEffect(() => {
    if (value) setSelected(value)
  }, [value])

  const selectedOption =
    options.find((o) => o.id === selected) ?? options[0]

  const handleSelect = (id: string) => {
    setSelected(id)
    onChange?.(id)
  }

  return (
    <Menu.Root positioning={{ sameWidth: true }}>
      <Menu.Trigger asChild>
        <Button
          variant="outline"
          w="full"
          justifyContent="space-between"
        >
          <VStack align="start" gap={0}>
            <Text fontSize="sm" color="gray.500">
              Voting system
            </Text>
            <Text fontWeight="semibold">
              {selectedOption.label}
            </Text>
          </VStack>
          <ChevronDown size={16} />
        </Button>
      </Menu.Trigger>

      <Menu.Positioner>
        <Menu.Content maxH="240px" overflowY="auto">
          {options.map((opt) => (
            <Menu.Item
              key={opt.id}
              value={opt.id}
              onClick={() => handleSelect(opt.id)}
            >
              {opt.label}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  )
}