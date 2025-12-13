import { Box } from "@chakra-ui/react"

export function Card({
  children,
  selected,
}: {
  children?: React.ReactNode
  selected?: boolean
}) {
  return (
    <Box
      w="56px"
      h="80px"
      borderRadius="lg"
      borderWidth={selected ? "2px" : "1px"}
      borderColor={selected ? "blue.400" : "blue.300"}
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize="xl"
      fontWeight="bold"
      color="blue.400"
      cursor="pointer"
      userSelect="none"
    >
      {children}
    </Box>
  )
}
