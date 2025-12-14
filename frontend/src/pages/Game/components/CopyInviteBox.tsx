import { Button } from "@chakra-ui/react"
import { useState, useRef } from "react"

export function CopyInviteBox({ gameId }: { gameId: string }) {
  const inviteLink = `${window.location.origin}/${gameId}`
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink)

    setCopied(true)

    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => {
      setCopied(false)
      timerRef.current = null
    }, 1500)
  }

  return (
    <Button
      w={160}
      h={50}
      onClick={handleCopy}
      colorScheme={copied ? "green" : "blue"}
      variant={copied ? "solid" : "outline"}
    >
      {copied ? "Copied!" : "Copy invitation link"}
    </Button>
  )
}
