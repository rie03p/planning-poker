import { Box, Text, VStack } from "@chakra-ui/react"

type Props = {
  name: string
  hasVoted: boolean
  vote?: string | null
  revealed?: boolean
}

export function ParticipantCard({ name, hasVoted, vote, revealed }: Props) {
  const showVote = revealed && vote !== null && vote !== undefined

  return (
    <VStack gap={1}>
      <Box
        position="relative"
        w="60px"
        h="80px"
        borderRadius="md"
        bg={hasVoted ? "blue.100" : "gray.200"}
        borderWidth={hasVoted ? "2px" : "1px"}
        borderColor={hasVoted ? "blue.400" : "gray.300"}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {showVote ? (
          <Text fontSize="3xl" fontWeight="bold" color="blue.600" lineHeight="1">
            {vote}
          </Text>
        ) : hasVoted ? (
          <Text
            fontSize="3xl"
            fontWeight="bold"
            color="blue.400"
            lineHeight="1"
          >
            ✓
          </Text>
        ) : null}
      </Box>

      <Text fontWeight="medium" fontSize="sm">
        {name}
      </Text>
    </VStack>
  )
}
