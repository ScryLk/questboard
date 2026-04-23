import { memo, useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

interface MobileHPBarProps {
  current: number;
  max: number;
  width: number;
}

function MobileHPBarInner({ current, max, width }: MobileHPBarProps) {
  const percent = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const ghostWidth = useRef(new Animated.Value(percent)).current;
  const realWidth = useRef(new Animated.Value(percent)).current;

  useEffect(() => {
    // Real bar snaps quickly
    Animated.timing(realWidth, {
      toValue: percent,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Ghost bar follows slowly (for damage taken effect)
    Animated.timing(ghostWidth, {
      toValue: percent,
      duration: 800,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [percent, ghostWidth, realWidth]);

  const barColor =
    percent > 0.5 ? "#00B894" : percent > 0.25 ? "#FDCB6E" : "#FF6B6B";

  return (
    <Animated.View style={[styles.container, { width }]}>
      {/* Ghost bar (red, shows damage taken) */}
      <Animated.View
        style={[
          styles.ghostBar,
          {
            width: ghostWidth.interpolate({
              inputRange: [0, 1],
              outputRange: [0, width - 2],
            }),
          },
        ]}
      />
      {/* Real HP bar */}
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: barColor,
            width: realWidth.interpolate({
              inputRange: [0, 1],
              outputRange: [0, width - 2],
            }),
          },
        ]}
      />
    </Animated.View>
  );
}

export const MobileHPBar = memo(MobileHPBarInner);

const styles = StyleSheet.create({
  container: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 2,
    overflow: "hidden",
  },
  ghostBar: {
    position: "absolute",
    left: 1,
    top: 0,
    height: 4,
    backgroundColor: "rgba(255, 68, 68, 0.5)",
    borderRadius: 2,
  },
  bar: {
    position: "absolute",
    left: 1,
    top: 0,
    height: 4,
    borderRadius: 2,
  },
});
