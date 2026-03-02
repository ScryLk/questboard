import { memo } from "react";
import { Heart, Shield, Footprints } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { TokenIcon } from "./token-icon";

interface CharacterHeaderProps {
  icon: string;
  iconColor: string;
  name: string;
  subtitle: string;
  hpCurrent: number;
  hpMax: number;
  ac: number;
  speed: number;
}

function CharacterHeaderInner({
  icon,
  iconColor,
  name,
  subtitle,
  hpCurrent,
  hpMax,
  ac,
  speed,
}: CharacterHeaderProps) {
  const hpPercent = hpMax > 0 ? Math.round((hpCurrent / hpMax) * 100) : 0;
  const hpColor =
    hpPercent > 50 ? "#00B894" : hpPercent > 25 ? "#F9CA24" : "#FF4444";

  return (
    <XStack paddingHorizontal={16} alignItems="center" gap={10}>
      {/* Avatar */}
      <Stack
        width={36}
        height={36}
        borderRadius={18}
        backgroundColor="#1A1A24"
        borderWidth={2}
        borderColor={iconColor}
        alignItems="center"
        justifyContent="center"
      >
        <TokenIcon name={icon} size={18} color={iconColor} />
      </Stack>

      {/* Name + subtitle */}
      <YStack flex={1} gap={1}>
        <Text fontSize={15} fontWeight="700" color="#E8E8ED" numberOfLines={1}>
          {name}
        </Text>
        <Text fontSize={11} color="#9090A0" numberOfLines={1}>
          {subtitle}
        </Text>
      </YStack>

      {/* Inline stats */}
      <XStack gap={10} alignItems="center">
        <XStack alignItems="center" gap={3}>
          <Heart size={12} color={hpColor} />
          <Text fontSize={12} fontWeight="600" color={hpColor}>
            {hpCurrent}/{hpMax}
          </Text>
        </XStack>
        <XStack alignItems="center" gap={3}>
          <Shield size={12} color="#74B9FF" />
          <Text fontSize={12} fontWeight="600" color="#74B9FF">
            {ac}
          </Text>
        </XStack>
        <XStack alignItems="center" gap={3}>
          <Footprints size={12} color="#00B894" />
          <Text fontSize={12} fontWeight="600" color="#00B894">
            {speed}
          </Text>
        </XStack>
      </XStack>
    </XStack>
  );
}

export const CharacterHeader = memo(CharacterHeaderInner);
