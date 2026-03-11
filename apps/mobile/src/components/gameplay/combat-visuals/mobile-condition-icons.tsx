import { memo } from "react";
import { StyleSheet } from "react-native";
import {
  AlertTriangle,
  Ban,
  EyeOff,
  CircleDot,
  Eye,
  Flame,
  Skull,
  Snowflake,
  Zap,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { Stack, Text, XStack } from "tamagui";

const CONDITION_CONFIG: Record<string, { icon: LucideIcon; color: string; abbr: string }> = {
  blinded: { icon: EyeOff, color: "#5A5A6E", abbr: "BLD" },
  charmed: { icon: CircleDot, color: "#E056A0", abbr: "CHR" },
  deafened: { icon: Ban, color: "#5A5A6E", abbr: "DEF" },
  frightened: { icon: AlertTriangle, color: "#FDCB6E", abbr: "FRT" },
  grappled: { icon: Ban, color: "#FF9F43", abbr: "GRP" },
  incapacitated: { icon: Ban, color: "#FF6B6B", abbr: "INC" },
  invisible: { icon: Eye, color: "#74B9FF", abbr: "INV" },
  paralyzed: { icon: Zap, color: "#FFFF44", abbr: "PAR" },
  petrified: { icon: Ban, color: "#9090A0", abbr: "PTR" },
  poisoned: { icon: Skull, color: "#00B894", abbr: "PSN" },
  prone: { icon: Ban, color: "#FF9F43", abbr: "PRN" },
  restrained: { icon: Ban, color: "#FF6B6B", abbr: "RST" },
  stunned: { icon: Zap, color: "#FDCB6E", abbr: "STN" },
  unconscious: { icon: Skull, color: "#FF4444", abbr: "UNC" },
  exhaustion: { icon: Flame, color: "#FF6B6B", abbr: "EXH" },
  concentrating: { icon: CircleDot, color: "#6C5CE7", abbr: "CON" },
  burning: { icon: Flame, color: "#FF6600", abbr: "BRN" },
  frozen: { icon: Snowflake, color: "#44BBFF", abbr: "FRZ" },
};

interface MobileConditionIconsProps {
  conditions: string[];
  maxVisible?: number;
  size?: "small" | "normal";
}

function MobileConditionIconsInner({
  conditions,
  maxVisible = 3,
  size = "small",
}: MobileConditionIconsProps) {
  if (conditions.length === 0) return null;

  const visible = conditions.slice(0, maxVisible);
  const overflow = conditions.length - maxVisible;
  const iconSize = size === "small" ? 8 : 12;
  const badgeSize = size === "small" ? 14 : 20;

  return (
    <XStack gap={2} flexWrap="wrap">
      {visible.map((cond) => {
        const config = CONDITION_CONFIG[cond.toLowerCase()];
        if (!config) return null;
        const Icon = config.icon;
        return (
          <Stack
            key={cond}
            width={badgeSize}
            height={badgeSize}
            borderRadius={badgeSize / 2}
            backgroundColor={`${config.color}30`}
            borderWidth={1}
            borderColor={`${config.color}60`}
            alignItems="center"
            justifyContent="center"
          >
            <Icon size={iconSize} color={config.color} />
          </Stack>
        );
      })}
      {overflow > 0 && (
        <Stack
          width={badgeSize}
          height={badgeSize}
          borderRadius={badgeSize / 2}
          backgroundColor="rgba(255, 255, 255, 0.08)"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={size === "small" ? 7 : 9} fontWeight="700" color="#5A5A6E">
            +{overflow}
          </Text>
        </Stack>
      )}
    </XStack>
  );
}

export const MobileConditionIcons = memo(MobileConditionIconsInner);
