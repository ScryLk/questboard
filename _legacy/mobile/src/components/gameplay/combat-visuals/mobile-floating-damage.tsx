import { memo, useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

const DAMAGE_TYPE_COLORS: Record<string, string> = {
  fogo: "#FF6600",
  fire: "#FF6600",
  gelo: "#44BBFF",
  cold: "#44BBFF",
  relâmpago: "#FFFF44",
  lightning: "#FFFF44",
  necrótico: "#8844DD",
  necrotic: "#8844DD",
  radiante: "#FFDD44",
  radiant: "#FFDD44",
  cortante: "#FF4444",
  slashing: "#FF4444",
  perfurante: "#FF6666",
  piercing: "#FF6666",
  contundente: "#FFAA44",
  bludgeoning: "#FFAA44",
  cura: "#44FF88",
  heal: "#44FF88",
};

interface MobileFloatingDamageProps {
  x: number;
  y: number;
  amount: number;
  damageType?: string;
  isHeal?: boolean;
  isCrit?: boolean;
  onDone?: () => void;
}

function MobileFloatingDamageInner({
  x,
  y,
  amount,
  damageType = "slashing",
  isHeal = false,
  isCrit = false,
  onDone,
}: MobileFloatingDamageProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(isCrit ? 1.3 : 1)).current;

  useEffect(() => {
    if (isCrit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (!isHeal) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const animations = [
      Animated.timing(translateY, { toValue: -50, duration: 900, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
    ];

    if (isCrit) {
      animations.push(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.6, duration: 150, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
        ]),
      );
    }

    Animated.parallel(animations).start(() => onDone?.());
  }, [translateY, opacity, scale, isCrit, isHeal, onDone]);

  const color = isHeal
    ? "#44FF88"
    : DAMAGE_TYPE_COLORS[damageType.toLowerCase()] ?? "#FF4444";

  return (
    <Animated.Text
      style={[
        styles.text,
        {
          left: x,
          top: y,
          color,
          fontSize: isCrit ? 24 : 18,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      {isHeal ? "+" : "-"}{amount}{isCrit ? "!" : ""}
    </Animated.Text>
  );
}

export const MobileFloatingDamage = memo(MobileFloatingDamageInner);

const styles = StyleSheet.create({
  text: {
    position: "absolute",
    fontWeight: "900",
    textShadowColor: "#000",
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
    zIndex: 90,
    pointerEvents: "none",
  },
});
