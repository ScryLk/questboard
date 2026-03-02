import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Stack, type StackProps } from "tamagui";

interface SkeletonProps extends StackProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
}

export function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  ...rest
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }}>
      <Stack
        width={width as number}
        height={height as number}
        borderRadius={radius}
        backgroundColor="$border"
        {...rest}
      />
    </Animated.View>
  );
}

export function SkeletonCard() {
  return (
    <Stack
      borderRadius={12}
      backgroundColor="$bgCard"
      borderWidth={1}
      borderColor="$border"
      padding={16}
      gap={12}
    >
      <Skeleton width="60%" height={16} />
      <Skeleton width="100%" height={12} />
      <Skeleton width="40%" height={12} />
    </Stack>
  );
}

export function SkeletonListItem() {
  return (
    <Stack
      marginHorizontal={16}
      marginBottom={12}
      borderRadius={12}
      backgroundColor="$bgCard"
      borderWidth={1}
      borderColor="$border"
      padding={16}
      flexDirection="row"
      gap={12}
    >
      <Skeleton width={48} height={48} radius={12} />
      <Stack flex={1} gap={8}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="100%" height={12} />
        <Skeleton width="50%" height={12} />
      </Stack>
    </Stack>
  );
}
