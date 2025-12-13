import { Button, Text } from "@chakra-ui/react"

export function ActionArea({
  myVote,
  revealed,
  reveal,
  reset,
}: {
  myVote: string | null
  revealed: boolean
  reveal: () => void
  reset: () => void
}) {
  if (!myVote) {
    return (
      <Text fontSize="xl" fontWeight="medium">
        Pick your cards!
      </Text>
    )
  }

  return (
    <Button
      colorPalette={revealed ? "gray" : "blue"}
      onClick={revealed ? reset : reveal}
    >
      {revealed ? "Start new votes" : "Reveal votes"}
    </Button>
  )
}
