import {IconButton, Tooltip} from '@chakra-ui/react';
import {useState, useRef, useEffect} from 'react';
import {Link, Check} from 'lucide-react';

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
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <IconButton
          onClick={handleCopy}
          variant={copied ? 'solid' : 'outline'}
          colorPalette={copied ? 'green' : 'gray'}
          aria-label='Copy invitation link'
        >
          {copied ? <Check size={16} /> : <Link size={16} />}
        </IconButton>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          {copied ? 'Copied!' : 'Copy invitation link'}
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
}
