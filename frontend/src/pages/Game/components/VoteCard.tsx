import { Box } from "@chakra-ui/react"

export function VoteCard({
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
      borderWidth="2px"
      borderColor="blue.400"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize="xl"
      fontWeight="bold"
      color={selected ? 'white' : 'blue.400'}
      cursor="pointer"
      userSelect="none"
      bg={selected ? 'blue.400' : 'white'}
      transform={selected ? "translateY(-8px)" : "translateY(0)"}
      transition="transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease"
      boxShadow={selected ? "lg" : "none"}
      _hover={{
        transform: selected
          ? "translateY(-8px)"
          : "translateY(-4px)",
        boxShadow: "md",
      }}
    >
      {children}
    </Box>
  )
}
