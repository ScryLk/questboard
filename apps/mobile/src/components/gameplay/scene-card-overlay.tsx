import { useEffect, useRef, memo } from "react";
import { Animated, StyleSheet, Pressable } from "react-native";
import { Text, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";

function SceneCardOverlayInner() {
  const visible = useGameplayStore((s) => s.sceneCardVisible);
  const card = useGameplayStore((s) => s.sceneCard);
  const hideSceneCard = useGameplayStore((s) => s.hideSceneCard);

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && card) {
      opacity.setValue(0);

      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => hideSceneCard());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible, card, opacity, hideSceneCard]);

  if (!visible || !card) return null;

  const isCinematic = card.variant === "cinematic";

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Pressable style={styles.pressable} onPress={hideSceneCard}>
        {/* Cinematic letterbox bars */}
        {isCinematic && <Animated.View style={styles.letterboxTop} />}

        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          paddingHorizontal={32}
          gap={8}
        >
          {card.chapter && (
            <Text
              fontSize={12}
              fontWeight="600"
              color="#5A5A6E"
              letterSpacing={4}
              textTransform="uppercase"
            >
              {card.chapter}
            </Text>
          )}

          <Text
            fontSize={isCinematic ? 32 : 28}
            fontWeight="800"
            color="#E8E8ED"
            textAlign="center"
            lineHeight={isCinematic ? 40 : 36}
          >
            {card.title}
          </Text>

          {card.subtitle && (
            <Text
              fontSize={16}
              color="#9090A0"
              fontStyle="italic"
              textAlign="center"
              marginTop={4}
            >
              {card.subtitle}
            </Text>
          )}

          {card.details && card.details.length > 0 && (
            <YStack marginTop={12} gap={4}>
              {card.details.map((detail, i) => (
                <Text
                  key={i}
                  fontSize={13}
                  color="#5A5A6E"
                  textAlign="center"
                >
                  {detail}
                </Text>
              ))}
            </YStack>
          )}
        </YStack>

        {isCinematic && <Animated.View style={styles.letterboxBottom} />}
      </Pressable>
    </Animated.View>
  );
}

export const SceneCardOverlay = memo(SceneCardOverlayInner);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    zIndex: 200,
  },
  pressable: {
    flex: 1,
  },
  letterboxTop: {
    height: 60,
    backgroundColor: "#000",
  },
  letterboxBottom: {
    height: 60,
    backgroundColor: "#000",
  },
});
