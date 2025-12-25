import {Button} from '@chakra-ui/react';
import {useState, useRef, useEffect} from 'react';

export type CopyInviteBoxProps = {
  gameId: string;
};

export function CopyInviteBox({gameId}: CopyInviteBoxProps) {
  const inviteLink = `${globalThis.location.origin}/${gameId}`;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
    } catch (error) {
      console.error('Failed to copy:', error);
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setCopied(false);
      timerRef.current = undefined;
    }, 1500);
  };

  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  return (
    <Button
      w={160}
      onClick={handleCopy}
      variant={copied ? 'solid' : 'outline'}
    >
      {copied ? 'Copied!' : 'Copy invitation link'}
    </Button>
  );
}
