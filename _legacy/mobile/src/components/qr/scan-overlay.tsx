import { useEffect } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Stack, Text } from "tamagui";
import { Flashlight } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const SCREEN = Dimensions.get("window");
const FRAME_SIZE = 240;

interface ScanOverlayProps {
  torchOn: boolean;
  onToggleTorch: () => void;
}

export function ScanOverlay({ torchOn, onToggleTorch }: ScanOverlayProps) {
  const scanY = useSharedValue(0);

  useEffect(() => {
    scanY.value = withRepeat(
      withTiming(FRAME_SIZE - 4, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [scanY]);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanY.value }],
  }));

  return (
    <Stack style={StyleSheet.absoluteFill}>
      {/* Top overlay */}
      <Stack
        flex={1}
        backgroundColor="rgba(0,0,0,0.6)"
        alignItems="center"
        justifyContent="flex-end"
        paddingBottom={20}
      >
        <Text fontSize={16} fontWeight="600" color="white">
          Aponte para o QR Code
        </Text>
      </Stack>

      {/* Middle row: left overlay + frame + right overlay */}
      <Stack flexDirection="row" height={FRAME_SIZE}>
        <Stack flex={1} backgroundColor="rgba(0,0,0,0.6)" />

        {/* Scan frame */}
        <Stack width={FRAME_SIZE} height={FRAME_SIZE}>
          {/* Corner decorations */}
          <Corner position="top-left" />
          <Corner position="top-right" />
          <Corner position="bottom-left" />
          <Corner position="bottom-right" />

          {/* Scanning line */}
          <Animated.View
            style={[
              {
                position: "absolute",
                left: 10,
                right: 10,
                height: 2,
                backgroundColor: "rgba(108, 92, 231, 0.5)",
                borderRadius: 1,
              },
              lineStyle,
            ]}
          />
        </Stack>

        <Stack flex={1} backgroundColor="rgba(0,0,0,0.6)" />
      </Stack>

      {/* Bottom overlay */}
      <Stack
        flex={1}
        backgroundColor="rgba(0,0,0,0.6)"
        alignItems="center"
        paddingTop={24}
        gap={16}
      >
        <Text fontSize={13} color="rgba(255,255,255,0.6)">
          da sessao ou campanha
        </Text>

        {/* Torch button */}
        <Stack
          height={44}
          paddingHorizontal={20}
          borderRadius={22}
          backgroundColor={torchOn ? "rgba(108,92,231,0.3)" : "rgba(255,255,255,0.15)"}
          flexDirection="row"
          alignItems="center"
          gap={8}
          onPress={onToggleTorch}
          pressStyle={{ opacity: 0.7 }}
        >
          <Flashlight size={18} color={torchOn ? "#6C5CE7" : "white"} />
          <Text fontSize={14} fontWeight="600" color={torchOn ? "#6C5CE7" : "white"}>
            Lanterna
          </Text>
        </Stack>
      </Stack>
    </Stack>
  );
}

function Corner({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const size = 20;
  const thickness = 3;

  const isTop = position.includes("top");
  const isLeft = position.includes("left");

  return (
    <Stack
      position="absolute"
      {...(isTop ? { top: 0 } : { bottom: 0 })}
      {...(isLeft ? { left: 0 } : { right: 0 })}
      width={size}
      height={size}
      borderColor="white"
      {...(isTop ? { borderTopWidth: thickness } : { borderBottomWidth: thickness })}
      {...(isLeft ? { borderLeftWidth: thickness } : { borderRightWidth: thickness })}
      {...(isTop && isLeft ? { borderTopLeftRadius: 4 } : {})}
      {...(isTop && !isLeft ? { borderTopRightRadius: 4 } : {})}
      {...(!isTop && isLeft ? { borderBottomLeftRadius: 4 } : {})}
      {...(!isTop && !isLeft ? { borderBottomRightRadius: 4 } : {})}
    />
  );
}
