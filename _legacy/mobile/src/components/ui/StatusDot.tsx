import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type StatusDotProps = {
  status: "online" | "away" | "offline" | "live";
  size?: number;
};

const STATUS_COLORS = {
  online: "#00B894",
  away: "#F9CA24",
  offline: "#5A5A6E",
  live: "#FF4444",
};

export function StatusDot({ status, size = 8 }: StatusDotProps) {
  const color = STATUS_COLORS[status];
  const pulse = status === "live";

  const animatedStyle = useAnimatedStyle(() => {
    if (!pulse) return { opacity: 1 };
    return {
      opacity: withRepeat(
        withSequence(
          withTiming(0.4, { duration: 800 }),
          withTiming(1, { duration: 800 }),
        ),
        -1,
        true,
      ),
    };
  });

  if (!pulse) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    );
  }

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}
