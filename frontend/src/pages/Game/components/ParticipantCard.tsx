import { Box, Text, VStack } from "@chakra-ui/react"

type Props = {
  name: string
  hasVoted: boolean
  vote?: string | null
  revealed?: boolean
}

export function ParticipantCard({
  name,
  hasVoted,
  vote,
  revealed = false,
}: Props) {
  const showVote = revealed && vote != null

  return (
    <VStack gap={1}>
      <Box w="60px" h="80px" perspective="800px">
        <Box
          position="relative"
          w="100%"
          h="100%"
          borderRadius="md"
          transformStyle="preserve-3d"
          transition="transform 500ms cubic-bezier(0.4, 0.2, 0.2, 1)"
          transform={showVote ? "rotateY(180deg)" : "rotateY(0deg)"}
        >
          {/* Front face */}
          <Box
            position="absolute"
            w="100%"
            h="100%"
            borderRadius="md"
            backfaceVisibility="hidden"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={hasVoted ? "blue.100" : "gray.200"}
            borderWidth={hasVoted ? "2px" : "1px"}
            borderColor={hasVoted ? "blue.400" : "gray.300"}
          >
            {hasVoted && (
              <Text
                fontSize="3xl"
                fontWeight="bold"
                color="blue.400"
                lineHeight="1"
              >
                ✓
              </Text>
            )}
          </Box>

          {/* Back face (vote revealed) */}
          <Box
            position="absolute"
            w="100%"
            h="100%"
            borderRadius="md"
            backfaceVisibility="hidden"
            transform="rotateY(180deg)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="white"
            borderWidth="2px"
            borderColor="blue.400"
          >
            <Text
              fontSize="3xl"
              fontWeight="bold"
              color="blue.600"
              lineHeight="1"
            >
              {vote}
            </Text>
          </Box>
        </Box>
      </Box>

      <Text fontWeight="medium" fontSize="sm">
        {name}
      </Text>
    </VStack>
  )
}
