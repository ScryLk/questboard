import { memo, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react-native";
import { Stack, Text, XStack } from "tamagui";
import { usePhaseStore } from "../../stores/phaseStore";
import { PHASE_META } from "../../constants/phaseTransitions";

function PhaseBadgeInner() {
  const current = usePhaseStore((s) => s.current);
  const openModal = usePhaseStore((s) => s.openModal);
  const getElapsedMinutes = usePhaseStore((s) => s.getElapsedMinutes);

  const [elapsed, setElapsed] = useState(getElapsedMinutes());

  useEffect(() => {
    setElapsed(getElapsedMinutes());
    const interval = setInterval(() => {
      setElapsed(getElapsedMinutes());
    }, 60_000);
    return () => clearInterval(interval);
  }, [getElapsedMinutes]);

  const meta = PHASE_META[current.type];
  const Icon = meta.icon;
  const isCombat = current.type === "combat";

  return (
    <XStack
      backgroundColor={meta.bgColor}
      borderWidth={1}
      borderColor={`${meta.color}30`}
      borderRadius={10}
      paddingHorizontal={10}
      paddingVertical={6}
      alignItems="center"
      gap={6}
      pressStyle={{ opacity: 0.7 }}
      onPress={openModal}
    >
      {isCombat && (
        <Stack
          width={6}
          height={6}
          borderRadius={3}
          backgroundColor="#F87171"
        />
      )}
      <Icon size={14} color={meta.color} />
      <Text fontSize={11} fontWeight="600" color={meta.color} numberOfLines={1}>
        {current.label}
      </Text>
      <Text fontSize={11} color={meta.color} opacity={0.5}>
        ·
      </Text>
      <Text fontSize={11} fontWeight="500" color={meta.color} opacity={0.7}>
        {elapsed}min
      </Text>
      <ChevronDown size={12} color={meta.color} opacity={0.5} />
    </XStack>
  );
}

export const PhaseBadge = memo(PhaseBadgeInner);
