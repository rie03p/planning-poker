import {HStack} from '@chakra-ui/react';
import {type Participant} from '@planning-poker/shared';
import {ParticipantCard} from './ParticipantCard';

type ParticipantGroupProps = {
  participants: Participant[];
  revealed: boolean;
};

export function ParticipantGroup({participants, revealed}: ParticipantGroupProps) {
  return (
    <HStack gap={8} justify='center' flexWrap='wrap' minH='120px' align='center' px={4}>
      {participants.map(p => (
        <ParticipantCard
          key={p.id}
          name={p.name}
          hasVoted={p.vote !== undefined}
          vote={p.vote}
          revealed={revealed}
          isSpectator={p.isSpectator}
        />
      ))}
    </HStack>
  );
}
