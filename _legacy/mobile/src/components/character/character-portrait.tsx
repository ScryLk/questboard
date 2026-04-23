// ── Character Portrait ──
// Reusable circular portrait with class color, initials, level badge, and class icon badge

import { useEffect, useRef } from "react";
import { Animated, Image } from "react-native";
import { Stack, Text } from "tamagui";
import { getClassColor, getClassIcon } from "../../lib/class-utils";

const SIZES = {
  sm: { circle: 40, font: 14, badge: 0 },
  md: { circle: 56, font: 18, badge: 18 },
  lg: { circle: 80, font: 24, badge: 22 },
  xl: { circle: 120, font: 36, badge: 26 },
} as const;

interface CharacterPortraitProps {
  name: string;
  classId: string;
  classIcon: string;
  level: number;
  avatarUrl?: string | null;
  size?: keyof typeof SIZES;
  selected?: boolean;
  unavailable?: boolean;
  pulsing?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function CharacterPortrait({
  name,
  classId,
  classIcon,
  level,
  avatarUrl,
  size = "lg",
  selected = false,
  unavailable = false,
  pulsing = false,
}: CharacterPortraitProps) {
  const dims = SIZES[size];
  const color = getClassColor(classId);
  const Icon = getClassIcon(classIcon);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulsing) {
      scaleAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulsing, scaleAnim]);

  const showBadges = size !== "sm";
  const iconSize = Math.round(dims.badge * 0.5);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Stack
        width={dims.circle}
        height={dims.circle}
        borderRadius={9999}
        backgroundColor={`${color}26`}
        borderWidth={selected ? 2.5 : 1.5}
        borderColor={selected ? color : `${color}66`}
        alignItems="center"
        justifyContent="center"
        opacity={unavailable ? 0.4 : 1}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{
              width: dims.circle - 4,
              height: dims.circle - 4,
              borderRadius: 9999,
            }}
          />
        ) : (
          <Text
            fontSize={dims.font}
            fontWeight="700"
            color={color}
          >
            {getInitials(name)}
          </Text>
        )}
      </Stack>

      {/* Level badge — bottom right */}
      {showBadges && (
        <Stack
          position="absolute"
          bottom={-2}
          right={-2}
          height={dims.badge}
          minWidth={dims.badge}
          paddingHorizontal={4}
          borderRadius={9999}
          backgroundColor="#1C1C24"
          borderWidth={1.5}
          borderColor="#0F0F12"
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontSize={Math.round(dims.badge * 0.5)}
            fontWeight="700"
            color="$textSecondary"
          >
            {level}
          </Text>
        </Stack>
      )}

      {/* Class icon badge — top right */}
      {showBadges && (
        <Stack
          position="absolute"
          top={-2}
          right={-2}
          height={dims.badge}
          width={dims.badge}
          borderRadius={9999}
          backgroundColor="#1C1C24"
          borderWidth={1.5}
          borderColor="#0F0F12"
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={iconSize} color={color} />
        </Stack>
      )}
    </Animated.View>
  );
}
