import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text, YStack } from "tamagui";
import type { SceneCardData } from "../../../lib/gameplay-store";

interface SceneCardPreviewProps {
  card: Partial<SceneCardData> & { variant: SceneCardData["variant"] };
}

function SceneCardPreviewInner({ card }: SceneCardPreviewProps) {
  const isCinematic = card.variant === "cinematic";
  const hasContent = !!card.title?.trim();

  if (!hasContent) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text fontSize={12} color="#5A5A6E" textAlign="center">
            Preencha os campos para ver o preview
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.previewBox}>
        {isCinematic && <View style={styles.letterbox} />}

        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          paddingHorizontal={16}
          gap={4}
        >
          {card.chapter && (
            <Text
              fontSize={8}
              fontWeight="600"
              color="#5A5A6E"
              letterSpacing={2}
              textTransform="uppercase"
            >
              {card.chapter}
            </Text>
          )}

          <Text
            fontSize={isCinematic ? 16 : 14}
            fontWeight="800"
            color="#E8E8ED"
            textAlign="center"
            numberOfLines={2}
          >
            {card.title}
          </Text>

          {card.subtitle && (
            <Text
              fontSize={10}
              color="#9090A0"
              fontStyle="italic"
              textAlign="center"
              numberOfLines={2}
            >
              {card.subtitle}
            </Text>
          )}

          {card.details && card.details.length > 0 && (
            <YStack marginTop={4} gap={2}>
              {card.details.slice(0, 3).map((detail, i) => (
                <Text key={i} fontSize={8} color="#5A5A6E" textAlign="center">
                  {detail}
                </Text>
              ))}
            </YStack>
          )}
        </YStack>

        {isCinematic && <View style={styles.letterbox} />}
      </View>
    </View>
  );
}

export const SceneCardPreview = memo(SceneCardPreviewInner);

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  placeholder: {
    height: 120,
    borderRadius: 12,
    backgroundColor: "#0F0F12",
    borderWidth: 1,
    borderColor: "#2A2A35",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  previewBox: {
    height: 200,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    overflow: "hidden",
  },
  letterbox: {
    height: 20,
    backgroundColor: "#000",
  },
});
