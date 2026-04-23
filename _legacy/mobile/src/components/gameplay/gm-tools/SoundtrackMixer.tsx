import { memo, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { TokenIcon } from "../token-icon";
import { useGameplayStore } from "../../../lib/gameplay-store";

function SoundtrackMixerInner() {
  const ambientLayers = useGameplayStore((s) => s.soundtrack.ambientLayers);
  const isMuted = useGameplayStore((s) => s.soundtrack.isMuted);
  const setAmbientLayerVolume = useGameplayStore((s) => s.setAmbientLayerVolume);

  const handleSliderPress = useCallback(
    (layerId: string, locationX: number, barWidth: number) => {
      const pct = Math.max(0, Math.min(100, Math.round((locationX / barWidth) * 100)));
      setAmbientLayerVolume(layerId, pct);
    },
    [setAmbientLayerVolume],
  );

  return (
    <YStack gap={6}>
      <Text fontSize={12} fontWeight="600" color="#9090A0" marginBottom={2}>
        Mixagem Rápida
      </Text>

      {ambientLayers.map((layer) => {
        const isActive = layer.volume > 0 && !isMuted;
        return (
          <XStack
            key={layer.id}
            height={36}
            alignItems="center"
            gap={8}
            paddingHorizontal={4}
          >
            {/* Icon */}
            <Stack
              width={24}
              height={24}
              borderRadius={6}
              backgroundColor={isActive ? "rgba(108, 92, 231, 0.15)" : "#1C1C24"}
              alignItems="center"
              justifyContent="center"
            >
              <TokenIcon
                name={layer.icon}
                size={12}
                color={isActive ? "#6C5CE7" : "#5A5A6E"}
              />
            </Stack>

            {/* Label */}
            <Text
              fontSize={11}
              color={isActive ? "#E8E8ED" : "#5A5A6E"}
              width={56}
              numberOfLines={1}
            >
              {layer.name}
            </Text>

            {/* Slider bar */}
            <View
              style={styles.sliderTrack}
              onTouchEnd={(e) => {
                const barWidth = 160;
                handleSliderPress(layer.id, e.nativeEvent.locationX, barWidth);
              }}
            >
              <View
                style={[
                  styles.sliderFill,
                  {
                    width: `${isMuted ? 0 : layer.volume}%`,
                    backgroundColor: isActive ? "#6C5CE7" : "#2A2A35",
                  },
                ]}
              />
            </View>

            {/* Percentage */}
            <Text
              fontSize={10}
              color={isActive ? "#9090A0" : "#3A3A45"}
              width={28}
              textAlign="right"
            >
              {isMuted ? 0 : layer.volume}%
            </Text>
          </XStack>
        );
      })}
    </YStack>
  );
}

export const SoundtrackMixer = memo(SoundtrackMixerInner);

const styles = StyleSheet.create({
  sliderTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1A1A24",
    overflow: "hidden",
  },
  sliderFill: {
    height: 6,
    borderRadius: 3,
  },
});
