import { Button } from "@chakra-ui/react"
import { useState, useRef, useEffect } from "react"

export interface CopyInviteBoxProps {
  gameId: string;
}

export function CopyInviteBox({ gameId }: CopyInviteBoxProps) {
  const inviteLink = `${window.location.origin}/${gameId}`
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
    } catch (err) {
      console.error("Failed to copy: ", err)
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setCopied(false)
      timerRef.current = null
    }, 1500)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (
    <Button
      w={160}
      h={50}
      onClick={handleCopy}
      variant={copied ? "solid" : "outline"}
    >
      {copied ? "Copied!" : "Copy invitation link"}
    </Button>
  )
}
